import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import type { NansenCliResponse } from "./types";
import {
  getCachedApiResponse,
  setCachedApiResponse,
} from "@/lib/cache/queries";

const execFileAsync = promisify(execFile);

// Prefer local node_modules/.bin, fall back to global
const LOCAL_BIN = path.join(process.cwd(), "node_modules", ".bin", "nansen");
const API_BASE = "https://api.nansen.ai/api/v1";

/**
 * Execute a Nansen CLI command and return parsed JSON.
 * Uses local caching to avoid redundant API calls.
 */
export async function nansenCli<T = unknown>(
  args: string[],
  cacheKey?: string
): Promise<NansenCliResponse<T>> {
  // Check cache first
  if (cacheKey) {
    const cached = getCachedApiResponse(cacheKey);
    if (cached) return cached as NansenCliResponse<T>;
  }

  try {
    const { stdout } = await execFileAsync(LOCAL_BIN, ["research", ...args], {
      timeout: 30_000,
      env: {
        ...process.env,
        NANSEN_API_KEY: process.env.NANSEN_API_KEY,
      },
    });

    const raw = JSON.parse(stdout);

    // CLI wraps array data in {pagination, data: [...]}
    // Unwrap so our types get the inner array/object directly
    const result = unwrapCliResponse<T>(raw);

    // Cache successful responses
    if (cacheKey && result.success) {
      setCachedApiResponse(cacheKey, result);
    }

    return result;
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; message?: string };
    // Try to parse CLI error output (it returns structured JSON errors)
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout) as NansenCliResponse<T>;
      } catch {
        // fall through
      }
    }
    return {
      success: false,
      data: null as T,
      error: error.message || "CLI execution failed",
      code: "CLI_ERROR",
    };
  }
}

/**
 * Fallback: Direct REST API call for endpoints not available in CLI.
 */
export async function nansenApi<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  cacheKey?: string
): Promise<NansenCliResponse<T>> {
  if (cacheKey) {
    const cached = getCachedApiResponse(cacheKey);
    if (cached) return cached as NansenCliResponse<T>;
  }

  const apiKey = process.env.NANSEN_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      data: null as T,
      error: "NANSEN_API_KEY not set",
      code: "NO_API_KEY",
    };
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return {
          success: false,
          data: null as T,
          error: `HTTP ${res.status}: ${detail}`,
          code: `HTTP_${res.status}`,
        };
      }

      const data = (await res.json()) as T;
      const result: NansenCliResponse<T> = { success: true, data };

      if (cacheKey) {
        setCachedApiResponse(cacheKey, result);
      }

      return result;
    } catch (err: unknown) {
      if (attempt === maxRetries) {
        return {
          success: false,
          data: null as T,
          error: (err as Error).message,
          code: "FETCH_ERROR",
        };
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  return { success: false, data: null as T, error: "Max retries exceeded", code: "MAX_RETRIES" };
}

/**
 * CLI responses for array endpoints come as:
 *   { success: true, data: { pagination: {...}, data: [...] } }
 * or for object endpoints:
 *   { success: true, data: { pagination: {...}, top5_tokens: [...], win_rate: 0.33, ... } }
 *
 * This unwraps the nested `data.data` array when present, keeping
 * the pagination info on the response wrapper.
 */
function unwrapCliResponse<T>(raw: Record<string, unknown>): NansenCliResponse<T> {
  if (!raw.success) {
    return raw as unknown as NansenCliResponse<T>;
  }

  const outer = raw.data as Record<string, unknown> | undefined;
  if (!outer || typeof outer !== "object") {
    return raw as unknown as NansenCliResponse<T>;
  }

  // If data has a nested `data` array, unwrap it
  if ("data" in outer && Array.isArray(outer.data)) {
    return {
      success: true,
      data: outer.data as T,
      pagination: outer.pagination as NansenCliResponse<T>["pagination"],
    };
  }

  // Otherwise return the outer data as-is (e.g., pnl-summary)
  return {
    success: true,
    data: outer as T,
    pagination: outer.pagination as NansenCliResponse<T>["pagination"],
  };
}

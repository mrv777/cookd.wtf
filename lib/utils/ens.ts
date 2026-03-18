import { search } from "@/lib/nansen/endpoints";

/**
 * Resolve ENS name to entity name via Nansen search.
 * Returns the entity_name if found, or the original input if not.
 */
export async function resolveEns(ensName: string): Promise<string> {
  const result = await search(ensName);
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    return result.data[0].entity_name;
  }
  return ensName;
}

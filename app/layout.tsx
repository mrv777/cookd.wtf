import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.SITE_URL || "https://cookd.wtf";

export const metadata: Metadata = {
  title: "Cookd — How Cooked Are You?",
  description:
    "Paste any wallet. Get roasted by Nansen on-chain data. Share the damage.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Cookd — How Cooked Are You?",
    description:
      "Paste any wallet. Get roasted by Nansen on-chain data. Share the damage.",
    url: siteUrl,
    siteName: "Cookd",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookd — How Cooked Are You?",
    description: "Paste any wallet. Get roasted by Nansen data. Share the damage.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${syne.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

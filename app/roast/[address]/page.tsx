import type { Metadata } from "next";
import { RoastView } from "./roast-view";

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const decoded = decodeURIComponent(address);
  const display = decoded.length > 20 ? `${decoded.slice(0, 6)}...${decoded.slice(-4)}` : decoded;
  const siteUrl = process.env.SITE_URL || "https://cookd.wtf";

  return {
    title: `Cookd: ${display}`,
    description: `See how cooked ${display} really is`,
    openGraph: {
      title: `Cookd: ${display}`,
      description: `See how cooked ${display} really is`,
      url: `${siteUrl}/roast/${address}`,
      siteName: "Cookd",
      type: "website",
      images: [
        {
          url: `${siteUrl}/api/og/${address}`,
          width: 1200,
          height: 630,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Cookd: ${display}`,
      description: "How cooked are you? Find out at cookd.wtf",
      images: [`${siteUrl}/api/og/${address}`],
    },
  };
}

export default async function RoastPage({ params }: Props) {
  const { address } = await params;
  return <RoastView address={decodeURIComponent(address)} />;
}

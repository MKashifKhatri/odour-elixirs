import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";
import "./foundation.css";
import "./components.css";
import "./storefront.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ["Odour Elixirs", "perfume", "fragrance", "perfume oil", "India"],
  openGraph: { type: "website", locale: "en_IN", siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>;
}

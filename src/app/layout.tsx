import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fortunecreative.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fortune Creative",
    template: "%s – Fortune Creative",
  },
  description:
    "A press agency for artists, productions, and organizations across Broadway and music.",
  openGraph: {
    siteName: "Fortune Creative",
    type: "website",
    locale: "en_US",
  },
  ...(process.env.SITE_STAGING === "true" && {
    robots: { index: false, follow: false },
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

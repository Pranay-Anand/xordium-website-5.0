import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xordium 5.0 — Flagship Technology Symbiosis",
  description:
    "Where cybernetic intellect confronts elite physical esports execution. 48 hours of multi-tier collegiate warfare at BIT.",
};

export const viewport: Viewport = {
  themeColor: "#282a36",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-dracula-bg)] text-[var(--color-dracula-fg)] antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

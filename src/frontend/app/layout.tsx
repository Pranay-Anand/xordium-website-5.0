import type { Metadata, Viewport } from "next";
import "@fontsource/anybody/700.css";
import "@fontsource/anybody/800.css";
import "@fontsource/anybody/900.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xordium 5.0 — Flagship Technology Symbiosis",
  description:
    "Where cybernetic intellect confronts elite physical esports execution. 48 hours of multi-tier collegiate warfare at BIT.",
};

export const viewport: Viewport = {
  themeColor: "#0a0c10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0c10] text-white antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

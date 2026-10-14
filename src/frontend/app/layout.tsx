import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import BackgroundCollage from "@/components/BackgroundCollage";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xordium 5.0 — Flagship Technology Symbiosis",
  description:
    "Where cybernetic intellect confronts elite physical esports execution. 48 hours of multi-tier collegiate warfare at BIT.",
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a2e] text-white antialiased">
        <BackgroundCollage>
          <SiteHeader />
          {children}
          <SiteFooter />
        </BackgroundCollage>
      </body>
    </html>
  );
}

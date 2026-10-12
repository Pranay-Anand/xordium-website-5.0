import type { Metadata, Viewport } from "next";
import "@fontsource/anybody";
import "@fontsource/space-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xordium 5.0",
  description: "Xordium 5.0",
};

export const viewport: Viewport = {
  themeColor: "#121318",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

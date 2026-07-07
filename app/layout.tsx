import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BubatzBande: Königreiche & Chaos",
  description: "BubatzBande: Königreiche & Chaos ist ein lokaler Fantasy-Kartenspiel-MVP mit Chaos-Elementen."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

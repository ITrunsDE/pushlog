import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipLog",
  description: "A changelog tool for indie hackers and solo developers",
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

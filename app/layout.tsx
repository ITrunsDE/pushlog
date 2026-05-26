import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, DM_Sans } from "next/font/google";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-display" 
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans" 
});
export const metadata: Metadata = {
  title: "Pushlog",
  description: "A changelog tool for indie hackers and solo developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}

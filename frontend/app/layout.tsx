import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const bodySans = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const displaySerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "AI Website Platform",
  description: "Hard-coded previews rendered from WebsiteConfig.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodySans.variable} ${displaySerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

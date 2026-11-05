import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const bodySans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

const displaySerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "SiteCraft",
  description: "Describe your business and generate a one-page website.",
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

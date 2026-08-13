import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TARS | Deep Focus Radio",
  description:
    "Film-score focus radio — Interstellar, Dunkirk, Oppenheimer, Tenet, Inception and The Odyssey in one cinematic listening room.",
  icons: { icon: "/monolith.svg" },
};

export const viewport: Viewport = {
  themeColor: "#06080d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

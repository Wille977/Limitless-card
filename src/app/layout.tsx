import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trader Identity | Limitless",
  description: "Discover your trader archetype on Limitless — the prediction market for everything.",
  icons: {
    icon: "/limitless-icon.png",
    apple: "/limitless-icon.png",
  },
  openGraph: {
    title: "Trader Identity | Limitless",
    description: "Discover your trader archetype on Limitless",
    siteName: "Limitless",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trader Identity | Limitless",
    description: "Discover your trader archetype on Limitless",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

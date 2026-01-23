import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google"; // Fixes TS2307 error
import "./globals.css";
import Clarity from "@/components/tracking/Clarity";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TopSpin - Office Table Tennis Ranking",
  description:
    "Track your office table tennis matches and climb the rankings with TopSpin. Join the waitlist now!",

  openGraph: {
    title: "TopSpin - Office Table Tennis Ranking",
    description:
      "Track your office table tennis matches and climb the rankings with TopSpin. Join the waitlist now!",
    url: "https://top-spin.vercel.app",
    siteName: "TopSpin",
    images: ["/meta-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSerifDisplay.variable} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <GoogleAnalytics gaId="G-24K8NK0X65" />
        <Clarity />
      </body>
    </html>
  );
}

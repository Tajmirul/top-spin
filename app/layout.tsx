import type { Metadata } from "next";
import { DM_Serif_Display } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

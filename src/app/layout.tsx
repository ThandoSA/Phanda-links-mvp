import type { Metadata, Viewport } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Phanda Links | The Hustle Deserves Visibility",
  description: "South Africa's leading opportunity marketplace connecting skilled workers with vetted clients. Find jobs, post work requests, and build your reputation with dignity and trust.",
  keywords: ["jobs in South Africa", "skilled workers", "freelance work", "opportunity marketplace", "trusted professionals"],
  authors: [{ name: "Phanda Links" }],
  creator: "Phanda Links",
  publisher: "Phanda Links",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "Phanda Links | The Hustle Deserves Visibility",
    description: "South Africa's opportunity marketplace. Connecting skilled workers with real clients through dignity, trust, and community.",
    url: siteUrl,
    siteName: "Phanda Links",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Phanda Links - The Hustle Deserves Visibility",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phanda Links | The Hustle Deserves Visibility",
    description: "Connecting skilled workers with real clients through dignity, trust, and community.",
    images: ["/images/og-image.jpg"],
    creator: "@phandalinks",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
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
      className={`${urbanist.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Toaster position="top-center" />
        <Analytics />
        {children}
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Phanda Links | The Hustle Deserves Visibility",
  description: "South Africa's opportunity marketplace. Connecting skilled workers with real clients through dignity, trust, and community.",
  openGraph: {
    title: "Phanda Links | The Hustle Deserves Visibility",
    description: "South Africa's opportunity marketplace. Connecting skilled workers with real clients.",
    url: "https://phandalinks.com",
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
    description: "Connecting skilled workers with real clients.",
    images: ["/images/og-image.jpg"],
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
        {children}
      </body>
    </html>
  );
}


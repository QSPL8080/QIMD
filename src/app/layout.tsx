import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import Aoscompo from "@/utils/aos";
import NextTopLoader from "nextjs-toploader";
import { siteConfig } from "@/data";
import { WebsiteSettingsProvider } from "@/app/context/WebsiteSettingsContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.qimd.in"),
  title: {
    default: `${siteConfig.name} – ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "QIMD Institute",
    "digital marketing course Pune",
    "graphic design course Pune",
    "video editing course Pune",
    "AI digital marketing",
    "AI graphic design",
    "AI video editing",
    "Hinjewadi training institute",
    "practical training Pune",
    "job assistance digital marketing",
    "placement guaranteed course Pune",
  ],
  authors: [{ name: siteConfig.name, url: "https://www.qimd.in" }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.qimd.in",
    siteName: siteConfig.name,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/logo/qimd-logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} – India's First AI Powered Marketing & Design Institute`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/logo/qimd-logo.png"],
    creator: "@qimdinstitute",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "48x48", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "96x96", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/favicon.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    apple: [
      { url: "/favicon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.qimd.in",
  },
};

import { db } from "@/lib/db";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let faviconUrl = "/favicon.svg";
  try {
    const ws = await db.websiteSettings.findFirst({ select: { favicon: true } });
    if (ws?.favicon && ws.favicon.trim()) {
      faviconUrl = ws.favicon;
    }
  } catch (err) {
    console.error("Layout favicon load error:", err);
  }

  const isSvg = faviconUrl.endsWith(".svg");

  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} href={faviconUrl} />
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} sizes="32x32" href={faviconUrl} />
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} sizes="48x48" href={faviconUrl} />
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} sizes="96x96" href={faviconUrl} />
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} sizes="192x192" href={faviconUrl} />
        <link rel="icon" type={isSvg ? "image/svg+xml" : "image/png"} sizes="512x512" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href={faviconUrl} />
        <meta name="apple-mobile-web-app-title" content="QIMD" />
        <meta name="application-name" content="QIMD" />
        <meta name="msapplication-TileImage" content={faviconUrl} />
      </head>
      <body className={`${plusJakartaSans.className} font-sans antialiased`} suppressHydrationWarning>
        <NextTopLoader color="#6366F1" showSpinner={false} height={2.5} crawl={true} speed={200} shadow="0 0 10px #6366F1,0 0 5px #6366F1" />
        <ThemeProvider
          attribute="class"
          enableSystem={true}
          defaultTheme="light"
        >
          <WebsiteSettingsProvider>
            <Aoscompo>
              <Header />
              <main>{children}</main>
              <Footer />
            </Aoscompo>
            <ScrollToTop />
          </WebsiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

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
      { url: "/images/logo/qimd-logo.png", type: "image/png" },
      { url: "/images/logo/qimd-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo/qimd-logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/images/logo/qimd-logo.png"],
    apple: [
      { url: "/images/logo/qimd-logo.png", sizes: "180x180", type: "image/png" },
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
  let faviconUrl = "/images/logo/qimd-logo.png";
  try {
    const ws = await db.websiteSettings.findFirst({ select: { favicon: true } });
    if (ws?.favicon) {
      faviconUrl = ws.favicon;
    }
  } catch (err) {
    console.error("Layout favicon load error:", err);
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" type="image/png" href={faviconUrl} />
        <link rel="icon" type="image/png" sizes="32x32" href={faviconUrl} />
        <link rel="icon" type="image/png" sizes="192x192" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href={faviconUrl} />
        <meta name="apple-mobile-web-app-title" content="QIMD" />
        <meta name="application-name" content="QIMD" />
        <meta name="msapplication-TileImage" content={faviconUrl} />
      </head>
      <body className={`${plusJakartaSans.className} font-sans antialiased`} suppressHydrationWarning>
        <NextTopLoader color="#F59E0B" showSpinner={false} />
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

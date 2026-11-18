import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import Aoscompo from "@/utils/aos";
import SiteMotion from "@/components/Common/SiteMotion";
import NextTopLoader from "nextjs-toploader";
import { siteConfig } from "@/data";
import { WebsiteSettingsProvider } from "@/app/context/WebsiteSettingsContext";

// Self-hosted institute fonts (Poppins for headings, Inter for body) — no build-time network needed
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://www.qimd.in"),
  title: {
    default: "AI-Powered Digital Marketing, Graphic Design & Video Editing Courses in Pune | QIMD",
    template: "%s | QIMD Institute",
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
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/favicon.ico" },
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
  let faviconUrl = "/favicon.ico";
  // Skip the database while `next build` pre-renders static pages
  // (prevents Prisma engine thread exhaustion on the build server).
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (!isBuildPhase) try {
    const ws = await db.websiteSettings.findFirst({ select: { favicon: true } });
    if (ws?.favicon && ws.favicon.trim()) {
      faviconUrl = ws.favicon;
    }
  } catch (err) {
    console.error("Layout favicon load error:", err);
  }

  const isSvg = faviconUrl.endsWith(".svg");

  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${inter.variable}`}>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
                window.scrollTo(0, 0);
              }
              try { document.documentElement.setAttribute('data-area', window.location.pathname.indexOf('/admin') === 0 ? 'admin' : 'site'); } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
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
            <SiteMotion />
          </WebsiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

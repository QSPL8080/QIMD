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
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.qimd.in",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Favicon: the Q mark from the QIMD logo (static files in /public)
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="QIMD" />
        <meta name="application-name" content="QIMD" />
        <meta name="msapplication-TileImage" content="/icon-192.png" />
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

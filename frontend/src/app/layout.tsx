import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { PWAInstaller } from "@/components/PWAInstaller";
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
  title: "FlowServe AI - Business Automation on WhatsApp",
  description: "Automate your Real Estate or Event Planning business with AI-powered WhatsApp assistant. Handle customer conversations, payments, and operations 24/7.",
  keywords: ["WhatsApp automation", "AI assistant", "Real Estate", "Event Planning", "Nigeria", "Business automation", "Paystack"],
  authors: [{ name: "FlowServe AI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlowServe AI",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "FlowServe AI",
    title: "FlowServe AI - Business Automation on WhatsApp",
    description: "Automate your Real Estate or Event Planning business with AI-powered WhatsApp assistant",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "FlowServe AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowServe AI - Business Automation on WhatsApp",
    description: "Automate your Real Estate or Event Planning business with AI-powered WhatsApp assistant",
    images: ["/icon-512x512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4A90E2" },
    { media: "(prefers-color-scheme: dark)", color: "#0A2540" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon-192x192.svg" type="image/svg+xml" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PWAInstaller />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

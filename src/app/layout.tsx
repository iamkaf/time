import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TIME - Free Open Source Time Tracking App",
    template: "%s | TIME"
  },
  description: "Free and open source time tracking app for productive people. Track work sessions, organize with tags, pause and resume timers, and view detailed productivity insights. Built by Kaf.",
  keywords: [
    "time tracking",
    "productivity app",
    "focus timer",
    "work timer",
    "session tracking",
    "open source",
    "free app",
    "productivity tools",
    "time management",
    "pomodoro timer"
  ],
  authors: [{ name: "Kaf", url: "https://github.com/iamkaf" }],
  creator: "Kaf",
  publisher: "Kaf",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://time.iamkaf.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://time.iamkaf.com',
    title: 'TIME - Free Open Source Time Tracking App',
    description: 'Free and open source time tracking app for productive people. Track work sessions with pause/resume, smart tagging, and productivity insights.',
    siteName: 'TIME',
    images: [
      {
        url: '/screenshots/dashboard.png',
        width: 1200,
        height: 800,
        alt: 'TIME Dashboard showing timer interface and productivity metrics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIME - Free Open Source Time Tracking App',
    description: 'Free and open source time tracking app for productive people. Built by @iamkaffe',
    site: '@iamkaffe',
    creator: '@iamkaffe',
    images: ['/screenshots/dashboard.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981',
  colorScheme: 'light dark'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

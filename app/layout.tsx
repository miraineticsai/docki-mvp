import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/chat/chat-widget";
import { JsonLd } from "@/components/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { clinicConfig } from "@/config/clinic";
import { cn } from "@/lib/utils";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL(clinicConfig.seo.siteUrl),
  title: {
    default: clinicConfig.seo.title,
    template: `%s | ${clinicConfig.name}`,
  },
  description: clinicConfig.seo.description,
  keywords: clinicConfig.seo.keywords,
  authors: [{ name: clinicConfig.doctor.name }],
  creator: clinicConfig.name,
  publisher: clinicConfig.name,
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: clinicConfig.seo.title,
    description: clinicConfig.seo.description,
    url: clinicConfig.seo.siteUrl,
    siteName: clinicConfig.name,
    images: [
      {
        url: clinicConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${clinicConfig.doctor.name} - ${clinicConfig.name}`,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: clinicConfig.seo.title,
    description: clinicConfig.seo.description,
    images: [clinicConfig.seo.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full w-full max-w-full overflow-x-hidden antialiased font-sans scroll-smooth",
        figtree.variable,
      )}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        {children}
        <ChatWidget />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

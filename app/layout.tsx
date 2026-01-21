import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "utveksle.no - Utveksling NTNU | Planlegg din utveksling",
  description:
    "Planlegg og utforsk utvekslingsmuligheter ved NTNU. Finn perfekt destinasjon basert på ditt studieprogram. Søk i fagbanken, les erfaringer fra andre studenter og planlegg din utveksling.",
  keywords: [
    "utveksling",
    "utveksle",
    "utveksling ntnu",
    "utveksling NTNU",
    "utvekslingsplanlegger",
    "utvekslingsfag",
    "utvekslingsuniversitet",
    "utveksling datateknologi",
    "utveksling kybernetikk",
    "utveksling indøk",
    "utvekslingserfaringer",
    "fagbank utveksling",
    "utvekslingskurs",
    "utveksling bologna",
    "utveksling australia",
    "utveksling usa",
    "godkjente fag utveksling ntnu",
  ],
  openGraph: {
    title: "utveksle.no - Utveksling NTNU",
    description: "Planlegg og utforsk utvekslingsmuligheter ved NTNU",
    url: "https://utveksle.no",
    siteName: "utveksle.no",
    locale: "no_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "utveksle.no - Utveksling NTNU",
    description: "Planlegg og utforsk utvekslingsmuligheter ved NTNU",
  },
  alternates: {
    canonical: "https://utveksle.no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16 flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative z-0">{children}</main>
          <Footer className="relative z-10" />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

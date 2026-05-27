import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MDify — Convert DOCX & PDF to Markdown Instantly",
  description:
    "MDify is a free, fast, and private tool that converts DOCX and PDF documents into clean Markdown format. Built for developers, researchers, and technical writers.",
  keywords: ["markdown", "docx to markdown", "pdf to markdown", "converter", "developer tool"],
  authors: [{ name: "MDify" }],
  metadataBase: new URL("https://mdify.app"),
  openGraph: {
    title: "MDify — DOCX & PDF to Markdown Converter",
    description: "Convert your documents to clean Markdown instantly. Free, private, and offline-capable.",
    type: "website",
    url: "https://mdify.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "MDify — DOCX & PDF to Markdown Converter",
    description: "Convert your documents to clean Markdown instantly.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NAJ — Full-Stack Developer Portfolio",
    template: "%s | NAJ",
  },
  description:
    "Portfolio of NAJ, a full-stack developer specializing in TypeScript, React, Next.js, Node.js, and modern web technologies.",
  keywords: [
    "developer",
    "portfolio",
    "full-stack",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "web developer",
  ],
  authors: [{ name: "NAJ" }],
  creator: "NAJ",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "NAJ Portfolio",
    title: "NAJ — Full-Stack Developer Portfolio",
    description:
      "Portfolio of NAJ, a full-stack developer specializing in TypeScript, React, Next.js, Node.js, and modern web technologies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NAJ — Full-Stack Developer Portfolio",
    description:
      "Portfolio of NAJ, a full-stack developer specializing in TypeScript, React, Next.js, Node.js, and modern web technologies.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

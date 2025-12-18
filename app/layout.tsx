import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unravel - AI Document Chat",
  description: "Chat with your documents using RAG-powered AI. Turn static documents into interactive, queryable knowledge.",
  keywords: ["AI", "RAG", "document chat", "PDF", "research", "study"],
  authors: [{ name: "Unravel" }],
  openGraph: {
    title: "Unravel - AI Document Chat",
    description: "Chat with your documents using RAG-powered AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Project Management",
    default: "Project Management: Dokumentasi dan Inventaris Proyek Software",
  },
  description:
    "Aplikasi web internal untuk mengelola, mendokumentasikan, dan menginventarisir proyek software secara rapi, aman, dan terpadu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <body className="min-h-[100dvh] font-sans bg-background text-foreground flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

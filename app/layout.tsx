import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Motoka App",
  description: "Gestion logistique de terrain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 return (
    <html lang="fr" className="dark"> 
      <body className="bg-zinc-50 dark:bg-[#09090b] transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}

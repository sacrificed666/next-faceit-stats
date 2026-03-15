import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FACEIT Stats",
  description: "FACEIT CS2 Stats",
  keywords: ["FACEIT", "CS2", "Stats", "Dashboard"],
  authors: [{ name: "Illia Movchko", url: "https://github.com/sacrificed666" }],
  creator: "Illia Movchko",
  publisher: "Illia Movchko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

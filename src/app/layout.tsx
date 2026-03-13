import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Faceit Stats",
  description: "Faceit Stats",
  keywords: ["Faceit", "Stats", "Next.js", "Tailwind CSS"],
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
      <body className={montserrat.className}>
        <Header />
        <main className="">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
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
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}

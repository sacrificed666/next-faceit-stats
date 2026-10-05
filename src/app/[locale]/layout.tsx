import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";

import { social } from "@/features/seo/model/seo";
import { createI18n } from "@/shared/i18n/create";
import I18nProvider from "@/shared/i18n/I18nProvider";
import { isLocale, LOCALES } from "@/shared/i18n/locales";
import { getI18n, getMessages } from "@/shared/i18n/server";
import { BOOT_SCRIPT } from "@/shared/lib/boot";
import { isIndexable, SITE, siteUrl } from "@/shared/lib/site";
import QueryReady from "@/shared/ui/QueryReady/QueryReady";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header/Header";

import "@/app/globals.scss";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const generateMetadata = async ({ params }: LayoutProps<"/[locale]">): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const i18n = await getI18n(locale);
  const name = i18n.t("app.name");
  const description = i18n.t("app.description");
  return {
    metadataBase: siteUrl(),
    title: { default: name, template: `%s · ${name}` },
    description,
    applicationName: name,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author.name, url: SITE.author.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    category: "sports",
    ...social(i18n, { title: name, description }),
    robots: isIndexable()
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    formatDetection: { telephone: false, address: false, email: false },
  };
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: SITE.themeColor.dark },
  ],
  colorScheme: "light dark",
};

const LocaleLayout = async ({ children, params }: LayoutProps<"/[locale]">) => {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);
  const i18n = createI18n(locale, messages);

  return (
    <html lang={locale} className={montserrat.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <I18nProvider locale={locale} messages={messages}>
          <a
            href="#main"
            className="fixed top-3 left-3 z-50 -translate-y-24 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink shadow-card transition-transform focus-visible:translate-y-0"
          >
            {i18n.t("app.skip")}
          </a>
          <Header i18n={i18n} />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 outline-none sm:px-6 lg:px-8"
          >
            {children}
          </main>
          <Footer i18n={i18n} />
          <QueryReady />
        </I18nProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;

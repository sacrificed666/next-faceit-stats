import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { DEFAULT_LOCALE, LOCALES } from "@/shared/i18n/locales";
import { cs } from "@/shared/i18n/messages/cs";
import { de } from "@/shared/i18n/messages/de";
import { en } from "@/shared/i18n/messages/en";
import { es } from "@/shared/i18n/messages/es";
import { fr } from "@/shared/i18n/messages/fr";
import { it } from "@/shared/i18n/messages/it";
import { nl } from "@/shared/i18n/messages/nl";
import { pl } from "@/shared/i18n/messages/pl";
import { pt } from "@/shared/i18n/messages/pt";
import { uk } from "@/shared/i18n/messages/uk";
import type { Messages } from "@/shared/i18n/translate";
import { BOOT_SCRIPT } from "@/shared/lib/boot";
import { homePath } from "@/shared/lib/urls";
import Logo from "@/shared/ui/Logo/Logo";

import "./globals.scss";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const CATALOG: Readonly<Record<(typeof LOCALES)[number], Messages>> = { en, uk, cs, de, es, fr, it, nl, pl, pt };

const text = (
  messages: Messages,
  key: "notFound.meta" | "notFound.title" | "notFound.body" | "notFound.home",
): string => {
  const message = messages[key];
  return (typeof message === "string" ? message : message.other).replace("{variable}", "FACEIT_PLAYERS");
};

const COPY = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    {
      meta: text(CATALOG[locale], "notFound.meta"),
      title: text(CATALOG[locale], "notFound.title"),
      body: text(CATALOG[locale], "notFound.body"),
      home: text(CATALOG[locale], "notFound.home"),
    },
  ]),
);

const LOCALIZE = `(function(copy){var locale=location.pathname.split("/")[1];var c=copy[locale];if(!c)return;document.documentElement.lang=locale;document.title=c.meta;document.getElementById("missing-title").textContent=c.title;document.getElementById("missing-body").textContent=c.body;var home=document.getElementById("missing-home");home.lastChild.textContent=c.home;home.setAttribute("href","/"+locale)})(${JSON.stringify(COPY).replaceAll("<", "\\u003c")})`;

const fallback = COPY[DEFAULT_LOCALE] ?? { meta: "", title: "", body: "", home: "" };

export const metadata: Metadata = {
  title: fallback.meta,
  robots: { index: false, follow: true },
};

const GlobalNotFound = () => (
  <html lang={DEFAULT_LOCALE} className={montserrat.variable} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
    </head>
    <body className="flex min-h-dvh flex-col font-sans">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-start gap-6 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Logo size={40} />
        <p className="text-7xl font-extrabold tracking-tight text-accent-text sm:text-8xl">404</p>
        <div className="flex flex-col gap-2">
          <h1
            id="missing-title"
            className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
            suppressHydrationWarning
          >
            {fallback.title}
          </h1>
          <p id="missing-body" className="max-w-xl text-ink-secondary" suppressHydrationWarning>
            {fallback.body}
          </p>
        </div>
        <a
          id="missing-home"
          href={homePath(DEFAULT_LOCALE)}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition-transform hover:-translate-y-0.5"
          suppressHydrationWarning
        >
          <span aria-hidden="true">←</span>
          <span suppressHydrationWarning>{fallback.home}</span>
        </a>
      </main>
      <script dangerouslySetInnerHTML={{ __html: LOCALIZE }} />
    </body>
  </html>
);

export default GlobalNotFound;

import en from "./en";
import ru from "./ru";
import sv from "./sv";
import fi from "./fi";
import da from "./da";
import no from "./no";

export const PRIMARY_LOCALES = ["en", "sv", "fi", "da", "no"] as const;
export const RU_LOCALE = "ru" as const;

export const LOCALES = ["en", "sv", "fi", "da", "no", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}

const dict = { en, ru, sv, fi, da, no } as const;

export type T = typeof en;

export function getT(locale: Locale): T {
  return dict[locale] ?? dict.en;
}

// Replace leading /{locale}/... with /{nextLocale}/...
export function normalizePathToLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return `/${nextLocale}`;

  const first = parts[0];
  if (isLocale(first)) {
    parts[0] = nextLocale;
    return "/" + parts.join("/");
  }

  // if no locale prefix, add
  return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

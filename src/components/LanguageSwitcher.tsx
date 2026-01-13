"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, Locale, normalizePathToLocale } from "@/src/i18n";

const LABELS: Record<Locale, string> = {
  en: "EN",
  sv: "SV",
  fi: "FI",
  da: "DA",
  no: "NO",
  ru: "RU",
};

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname() || `/${locale}`;

  function go(nextLocale: Locale) {
    const nextPath = normalizePathToLocale(pathname, nextLocale);
    router.push(nextPath);
  }

  return (
    <select
      className="pill"
      value={locale}
      onChange={(e) => go(e.target.value as Locale)}
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
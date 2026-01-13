"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, Locale, normalizePathToLocale } from "@/src/i18n";

function label(l: Locale) {
  switch (l) {
    case "en":
      return "EN";
    case "sv":
      return "SV";
    case "fi":
      return "FI";
    case "da":
      return "DA";
    case "no":
      return "NO";
    case "ru":
      return "RU";
    default:
      return l.toUpperCase();
  }
}

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
          {label(l)}
        </option>
      ))}
    </select>
  );
}
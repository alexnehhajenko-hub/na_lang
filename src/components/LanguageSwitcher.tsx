"use client";

import { usePathname, useRouter } from "next/navigation";
import { Locale, PRIMARY_LOCALES, RU_LOCALE, normalizePathToLocale } from "@/src/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname() || "/en";

  function go(nextLocale: Locale) {
    const nextPath = normalizePathToLocale(pathname, nextLocale);
    router.push(nextPath);
  }

  const primaryValue = locale === RU_LOCALE ? "en" : locale;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select
        className="pill"
        value={primaryValue}
        onChange={(e) => go(e.target.value as Locale)}
        aria-label="Language"
      >
        {PRIMARY_LOCALES.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>

      <button
        className={locale === RU_LOCALE ? "btn" : "btnGhost"}
        onClick={() => go(RU_LOCALE)}
        type="button"
        aria-label="Русский"
      >
        RU
      </button>
    </div>
  );
}

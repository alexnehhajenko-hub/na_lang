"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

type Locale = "en" | "sv" | "fi" | "no" | "da" | "ru" | "et";

const LOCALES: Locale[] = ["en", "ru", "et", "sv", "fi", "no", "da"];

const LABELS: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  et: "ET",
  sv: "SV",
  fi: "FI",
  no: "NO",
  da: "DA",
};

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathname = usePathname() || "/";

  const restPath = useMemo(() => {
    // pathname: /ru/quote  OR  /ru  OR  /
    const parts = pathname.split("/").filter(Boolean);

    // If first segment is a locale, drop it
    if (parts.length > 0 && LOCALES.includes(parts[0] as Locale)) {
      parts.shift();
    }

    const tail = parts.join("/");
    return tail ? `/${tail}` : "";
  }, [pathname]);

  function go(nextLocale: Locale) {
    const search = typeof window !== "undefined" ? window.location.search : "";
    window.location.href = `/${nextLocale}${restPath}${search}`;
  }

  return (
    <div className="lang">
      <select
        className="langSelect"
        value={currentLocale}
        onChange={(e) => go(e.target.value as Locale)}
        aria-label="Language"
      >
        {LOCALES.map((lc) => (
          <option key={lc} value={lc}>
            {LABELS[lc]}
          </option>
        ))}
      </select>
    </div>
  );
}
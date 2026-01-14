import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";

type Locale = "en" | "sv" | "fi" | "no" | "da" | "ru";

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="header">
      <div className="brand">
        <Link href={`/${locale}`} className="brandLink" aria-label="AKWELD">
          <Image
            src="/akweld-emblem.png.PNG"
            alt="AKWELD"
            width={44}
            height={44}
            className="brandLogo"
            priority
          />
          <span className="brandText">AKWELD</span>
        </Link>
      </div>

      <div className="actions">
        <LanguageSwitcher currentLocale={locale} />

        {/* Кнопка должна вести на локализованный роут */}
        <Link href={`/${locale}/quote`} className="cta">
          {locale === "ru" ? "Запросить цену" : "Get a quote"}
        </Link>
      </div>
    </header>
  );
}
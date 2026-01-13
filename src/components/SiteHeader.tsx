import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { getT, type Locale } from "@/src/i18n";

export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = getT(locale);

  return (
    <header className="headerRow">
      <Link href={`/${locale}`} className="brand">
        <span className="brandName">AKWELD</span>
        <span className="brandTag">{t.common.tagline}</span>
      </Link>

      <nav className="nav" aria-label="Main navigation">
        <Link href={`/${locale}/services`}>{t.nav.services}</Link>
        <Link href={`/${locale}/projects`}>{t.nav.projects}</Link>
        <Link href={`/${locale}/contact`}>{t.nav.contact}</Link>
      </nav>

      <div className="headerRight">
        <LanguageSwitcher locale={locale} />
        <Link className="btn" href={`/${locale}/contact`}>
          {t.common.getQuote}
        </Link>
      </div>
    </header>
  );
}

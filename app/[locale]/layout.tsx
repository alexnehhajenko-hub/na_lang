import { notFound } from "next/navigation";
import SiteHeader from "@/src/components/SiteHeader";
import SiteFooter from "@/src/components/SiteFooter";
import { isLocale, type Locale } from "@/src/i18n";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "sv" }, { locale: "fi" }, { locale: "da" }, { locale: "no" }, { locale: "ru" }];
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  return (
    <div>
      <div className="topbar">
        <div className="container">
          <SiteHeader locale={locale} />
        </div>
      </div>

      <main>{children}</main>

      <div className="container">
        <SiteFooter locale={locale} />
      </div>
    </div>
  );
}

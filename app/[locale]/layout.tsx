import type { ReactNode } from "react";
import SiteHeader from "@/src/components/SiteHeader";
import SiteFooter from "@/src/components/SiteFooter";

type Locale = "en" | "sv" | "fi" | "no" | "da" | "ru";

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  const locale = params.locale;

  return (
    <html lang={locale}>
      <body>
        <div className="topbar">
          <div className="container">
            <SiteHeader locale={locale} />
          </div>
        </div>

        <main className="container">{children}</main>

        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
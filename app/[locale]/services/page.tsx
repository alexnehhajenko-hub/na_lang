import Link from "next/link";
import { getT, type Locale } from "@/src/i18n";

export default function ServicesPage({ params }: { params: { locale: Locale } }) {
  const t = getT(params.locale);

  return (
    <div className="container">
      <section className="section">
        <h1 className="heroTitle" style={{ fontSize: 30, marginBottom: 10 }}>
          {t.services.title}
        </h1>
        <p className="heroText">{t.services.lead}</p>

        <div className="section" style={{ paddingTop: 14 }}>
          <div className="cards">
            {t.services.cards.map((c) => (
              <Link
                key={c.slug}
                href={`/${params.locale}/services/${c.slug}`}
                className="card"
                style={{ display: "block" }}
              >
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <p className="small">{t.services.note}</p>
      </section>
    </div>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT, type Locale } from "@/src/i18n";

export default function ServiceDetailPage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const t = getT(params.locale);
  const service = t.services.cards.find((x) => x.slug === params.slug);

  if (!service) notFound();

  return (
    <div className="container">
      <section className="section">
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <h1 className="heroTitle" style={{ fontSize: 28, margin: 0 }}>
                {service.title}
              </h1>
              <p className="heroText" style={{ marginTop: 8 }}>
                {service.text}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link className="btnGhost" href={`/${params.locale}/services`}>
                {t.common.viewServices}
              </Link>
              <Link className="btn" href={`/${params.locale}/contact`}>
                {t.common.getQuote}
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t.services.detailsTitle}</h3>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
            {service.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <div className="small" style={{ marginTop: 12 }}>
            {t.services.photoHint.replace("{slug}", service.slug)}
          </div>
        </div>
      </section>
    </div>
  );
}

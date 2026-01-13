import Link from "next/link";
import { getT, type Locale } from "@/src/i18n";

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const t = getT(params.locale);

  return (
    <div className="container">
      <section className="hero">
        <div className="heroGrid">
          <div className="heroCard">
            <h1 className="heroTitle">
              {t.home.heroTitle1} <span>{t.home.heroTitle2}</span>
            </h1>
            <p className="heroText">{t.home.heroText}</p>

            <div className="heroActions">
              <Link className="btn" href={`/${params.locale}/contact`}>
                {t.common.getQuote}
              </Link>
              <Link className="btnGhost" href={`/${params.locale}/services`}>
                {t.common.viewServices}
              </Link>
            </div>

            <div className="kpis">
              <div className="kpi">
                <strong>{t.home.kpi1Top}</strong>
                <span>{t.home.kpi1Bottom}</span>
              </div>
              <div className="kpi">
                <strong>{t.home.kpi2Top}</strong>
                <span>{t.home.kpi2Bottom}</span>
              </div>
              <div className="kpi">
                <strong>{t.home.kpi3Top}</strong>
                <span>{t.home.kpi3Bottom}</span>
              </div>
              <div className="kpi">
                <strong>{t.home.kpi4Top}</strong>
                <span>{t.home.kpi4Bottom}</span>
              </div>
            </div>
          </div>

          <div className="heroCard">
            <h2 className="sectionTitle">{t.home.focusTitle}</h2>
            <div className="cards">
              {t.home.focusCards.map((c) => (
                <div key={c.title} className="card">
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ marginTop: 12, position: "relative" }}>
              {t.home.complianceNote}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">{t.home.servicesTitle}</h2>
        <div className="cards">
          {t.services.cards.slice(0, 6).map((s) => (
            <div key={s.title} className="card">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">{t.home.projectsTitle}</h2>
        <div className="cards">
          {t.projects.items.slice(0, 6).map((p) => (
            <div key={p.title} className="card">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link className="btnGhost" href={`/${params.locale}/projects`}>
            {t.common.viewProjects}
          </Link>
        </div>
      </section>
    </div>
  );
}

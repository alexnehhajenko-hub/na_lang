import { getT, type Locale } from "@/src/i18n";

export default function ProjectsPage({ params }: { params: { locale: Locale } }) {
  const t = getT(params.locale);

  return (
    <div className="container">
      <section className="section">
        <h1 className="heroTitle" style={{ fontSize: 30, marginBottom: 10 }}>
          {t.projects.title}
        </h1>
        <p className="heroText">{t.projects.lead}</p>

        <div className="section" style={{ paddingTop: 14 }}>
          <div className="cards">
            {t.projects.items.map((p) => (
              <div key={p.title} className="card">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="small">{t.projects.note}</p>
      </section>
    </div>
  );
}

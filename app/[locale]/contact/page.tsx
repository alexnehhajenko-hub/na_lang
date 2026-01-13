import Link from "next/link";
import { getT, type Locale } from "@/src/i18n";

export default function ContactPage({ params }: { params: { locale: Locale } }) {
  const t = getT(params.locale);

  return (
    <div className="container">
      <section className="section">
        <h1 className="heroTitle" style={{ fontSize: 30, marginBottom: 10 }}>
          {t.contact.title}
        </h1>
        <p className="heroText">{t.contact.lead}</p>

        <div className="cards" style={{ marginTop: 14 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t.contact.block1Title}</h3>
            <p>{t.contact.block1Text}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t.contact.block2Title}</h3>
            <p>{t.contact.block2Text}</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t.contact.block3Title}</h3>
            <p>{t.contact.block3Text}</p>
          </div>
        </div>

        <div className="section" style={{ paddingTop: 18 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t.common.getQuote}</h3>

            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <input className="input" placeholder={t.contact.formName} />
              <input className="input" placeholder={t.contact.formPhone} />
              <input className="input" placeholder={t.contact.formEmail} />
              <textarea className="textarea" placeholder={t.contact.formMessage} />
              <button className="btn" type="submit">
                {t.contact.formSend}
              </button>
              <div className="small">{t.contact.formHint}</div>
            </form>

            <div style={{ marginTop: 12 }}>
              <Link className="btnGhost" href={`/${params.locale}/services`}>
                {t.common.viewServices}
              </Link>
            </div>
          </div>

          <p className="small" style={{ marginTop: 12 }}>
            {t.contact.note}
          </p>
        </div>
      </section>
    </div>
  );
}

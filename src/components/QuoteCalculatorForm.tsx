"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./QuoteCalculatorForm.module.css";

type CalcMode = "weight" | "hours";
type Region = "baltics" | "scandinavia" | "both";
type Complexity = "standard" | "precision";
type SteelSupply = "client" | "akweld";

type Locale = "en" | "ru" | "sv" | "fi" | "da" | "no" | "et";

const SUPPORTED: Locale[] = ["en", "ru", "sv", "fi", "da", "no", "et"];

function detectLocale(pathname: string): Locale {
  const seg = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
  if (seg && SUPPORTED.includes(seg)) return seg;
  return "en";
}

function money(n: number) {
  const rounded = Math.round(n);
  return rounded.toLocaleString("ru-RU") + " €";
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export default function QuoteCalculatorForm() {
  const pathname = usePathname() || "/";
  const locale = detectLocale(pathname);

  // По твоей просьбе делаем тексты на RU (позже разнесём в i18n на все языки качественно)
  const isRu = locale === "ru";

  const [mode, setMode] = useState<CalcMode>("weight");

  // Контакты
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Проект
  const [region, setRegion] = useState<Region>("both");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState<"normal" | "fast">("normal");

  // База расчёта
  const [weightTons, setWeightTons] = useState<number>(2);
  const [hours, setHours] = useState<number>(80);

  // Цена/ставки (ориентиры — ты потом подправишь под ваши реальные)
  const [ratePerTon, setRatePerTon] = useState<number>(650); // €/т (работы без металла)
  const [ratePerHour, setRatePerHour] = useState<number>(55); // €/ч

  // Металл (если AKweld закупает)
  const [steelSupply, setSteelSupply] = useState<SteelSupply>("client");
  const [steelPricePerTon, setSteelPricePerTon] = useState<number>(950); // €/т (ориентир)
  const [steelMarkupPct, setSteelMarkupPct] = useState<number>(6); // %

  // Опции влияющие на цену
  const [designSupport, setDesignSupport] = useState(false); // чертежи/КМ/КМД
  const [qaDocs, setQaDocs] = useState(true); // WPS/PQR, отчёты, паспорта
  const [ndt, setNdt] = useState<"none" | "vt" | "mt" | "ut">("vt"); // контроль
  const [tolerances, setTolerances] = useState<Complexity>("standard"); // точность/рихтовка
  const [surfacePrep, setSurfacePrep] = useState<"none" | "sa2_5" | "brush">("none");
  const [coating, setCoating] = useState<"none" | "primer" | "paint" | "galv">("none");
  const [siteInstallation, setSiteInstallation] = useState(false);
  const [transport, setTransport] = useState(false);
  const [lifting, setLifting] = useState(false); // краны/такелаж
  const [rush, setRush] = useState(false); // срочно

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMsg, setServerMsg] = useState<string>("");

  const calc = useMemo(() => {
    // База
    const base =
      mode === "weight"
        ? clamp(weightTons, 0.1, 2000) * clamp(ratePerTon, 1, 100000)
        : clamp(hours, 1, 200000) * clamp(ratePerHour, 1, 1000);

    let total = base;

    // Сложность/точность
    if (tolerances === "precision") total *= 1.22; // больше рихтовки, измерений и времени

    // Документация/процессы
    if (designSupport) total += 250; // инженерка/поддержка
    if (qaDocs) total += 120; // базовый пакет документации

    // Контроль
    if (ndt === "vt") total += 90;
    if (ndt === "mt") total += 240;
    if (ndt === "ut") total += 420;

    // Подготовка/покраска
    if (surfacePrep === "brush") total += base * 0.05;
    if (surfacePrep === "sa2_5") total += base * 0.10;

    if (coating === "primer") total += base * 0.08;
    if (coating === "paint") total += base * 0.18;
    if (coating === "galv") total += base * 0.22;

    // Логистика/монтаж
    if (transport) total += 180;
    if (lifting) total += 240;
    if (siteInstallation) total += base * 0.20;

    // Регион/сроки
    if (region === "scandinavia") total += 120;
    if (region === "both") total += 180;

    if (deadline === "fast") total += 150;
    if (rush) total *= 1.15;

    // Металл (если вы поставляете)
    let steelCost = 0;
    if (steelSupply === "akweld") {
      const tons = clamp(weightTons, 0.1, 2000);
      const p = clamp(steelPricePerTon, 1, 100000);
      steelCost = tons * p * (1 + clamp(steelMarkupPct, 0, 50) / 100);
      total += steelCost;
    }

    return {
      base,
      steelCost,
      total,
    };
  }, [
    mode,
    weightTons,
    hours,
    ratePerTon,
    ratePerHour,
    tolerances,
    designSupport,
    qaDocs,
    ndt,
    surfacePrep,
    coating,
    siteInstallation,
    transport,
    lifting,
    region,
    deadline,
    rush,
    steelSupply,
    steelPricePerTon,
    steelMarkupPct,
  ]);

  const requestText = useMemo(() => {
    const lines: string[] = [];
    lines.push("ЗАПРОС РАСЧЁТА (AKWELD)");
    lines.push("");
    lines.push(`Контакт: ${name || "-"} | Компания: ${company || "-"}`);
    lines.push(`Телефон/WhatsApp: ${phone || "-"} | Email: ${email || "-"}`);
    lines.push("");
    lines.push(`Регион: ${region === "baltics" ? "Прибалтика" : region === "scandinavia" ? "Скандинавия" : "Скандинавия + Прибалтика"}`);
    lines.push(`Локация объекта: ${location || "-"}`);
    lines.push(`Срок: ${deadline === "fast" ? "Срочно" : "Обычно"}`);
    lines.push("");
    lines.push(`Модель расчёта: ${mode === "weight" ? "По весу" : "По часам"}`);
    if (mode === "weight") lines.push(`Вес: ${weightTons} т`);
    if (mode === "hours") lines.push(`Трудоёмкость: ${hours} ч`);
    lines.push("");
    lines.push(`Точность/рихтовка: ${tolerances === "precision" ? "Повышенная точность (много подгонки)" : "Стандарт"}`);
    lines.push(`Документация (WPS/отчёты/паспорта): ${qaDocs ? "Да" : "Нет"}`);
    lines.push(`Инженерная поддержка (КМ/КМД): ${designSupport ? "Да" : "Нет"}`);
    lines.push(`Контроль сварных соединений: ${
      ndt === "none" ? "Нет" : ndt === "vt" ? "VT (визуальный)" : ndt === "mt" ? "MT (магнитопорошковый)" : "UT (ультразвук)"
    }`);
    lines.push("");
    lines.push(`Подготовка поверхности: ${
      surfacePrep === "none" ? "Нет" : surfacePrep === "brush" ? "Мех. зачистка" : "Дробеструй Sa 2.5"
    }`);
    lines.push(`Покрытие: ${
      coating === "none" ? "Нет" : coating === "primer" ? "Грунт" : coating === "paint" ? "Окраска" : "Горячее цинкование"
    }`);
    lines.push("");
    lines.push(`Доставка: ${transport ? "Да" : "Нет"}`);
    lines.push(`Краны/такелаж: ${lifting ? "Да" : "Нет"}`);
    lines.push(`Монтаж на объекте: ${siteInstallation ? "Да" : "Нет"}`);
    lines.push(`Экспресс: ${rush ? "Да" : "Нет"}`);
    lines.push("");
    lines.push(`Металл: ${steelSupply === "client" ? "Предоставляет заказчик" : "Закупает AKWELD"}`);
    if (steelSupply === "akweld") {
      lines.push(`Цена металла (ориентир): ${steelPricePerTon} €/т + ${steelMarkupPct}%`);
    }
    lines.push("");
    lines.push("Описание / замечания:");
    lines.push(notes || "-");
    lines.push("");
    lines.push(`Ориентир по цене (авторасчёт): ${money(calc.total)}`);
    lines.push("(Это предварительная оценка. Итог зависит от чертежей, марки стали, объёма и требований.)");
    return lines.join("\n");
  }, [
    name,
    company,
    phone,
    email,
    region,
    location,
    deadline,
    mode,
    weightTons,
    hours,
    tolerances,
    qaDocs,
    designSupport,
    ndt,
    surfacePrep,
    coating,
    transport,
    lifting,
    siteInstallation,
    rush,
    steelSupply,
    steelPricePerTon,
    steelMarkupPct,
    notes,
    calc.total,
  ]);

  async function handleSubmit() {
    setStatus("sending");
    setServerMsg("");

    try {
      const payload = {
        locale,
        createdAt: new Date().toISOString(),
        name,
        company,
        phone,
        email,
        region,
        location,
        deadline,
        mode,
        weightTons,
        hours,
        ratePerTon,
        ratePerHour,
        steelSupply,
        steelPricePerTon,
        steelMarkupPct,
        tolerances,
        designSupport,
        qaDocs,
        ndt,
        surfacePrep,
        coating,
        transport,
        lifting,
        siteInstallation,
        rush,
        notes,
        estimateEur: Math.round(calc.total),
        requestText,
      };

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Request failed");

      setStatus("sent");
      setServerMsg("Запрос сформирован и отправлен на сервер. Ниже можно скопировать текст заявки.");
    } catch (e: any) {
      setStatus("error");
      setServerMsg(e?.message || "Ошибка отправки. Попробуйте позже.");
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(requestText);
      setServerMsg("Текст заявки скопирован ✅");
    } catch {
      setServerMsg("Не удалось скопировать. Выдели текст вручную и скопируй.");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Запросить цену — калькулятор</h1>
        <p className={styles.sub}>
          Отметь требования — получишь ориентир по цене и готовый текст заявки. (Пока RU, потом включим качественные переводы на все языки.)
        </p>

        <div className={styles.grid}>
          <div className={styles.block}>
            <h2 className={styles.h2}>Контакты</h2>
            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Имя</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
              </label>
              <label className={styles.field}>
                <span>Компания</span>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Название компании" />
              </label>
            </div>
            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Телефон / WhatsApp</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+372 ..." />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
              </label>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.h2}>Проект</h2>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Регион</span>
                <select value={region} onChange={(e) => setRegion(e.target.value as Region)}>
                  <option value="baltics">Прибалтика</option>
                  <option value="scandinavia">Скандинавия</option>
                  <option value="both">Скандинавия + Прибалтика</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Срок</span>
                <select value={deadline} onChange={(e) => setDeadline(e.target.value as any)}>
                  <option value="normal">Обычно</option>
                  <option value="fast">Срочно</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span>Локация объекта (город/страна)</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Например: Tallinn / Stockholm" />
            </label>

            <div className={styles.sep} />

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Модель расчёта</span>
                <select value={mode} onChange={(e) => setMode(e.target.value as CalcMode)}>
                  <option value="weight">По весу (тонны)</option>
                  <option value="hours">По часам (трудоёмкость)</option>
                </select>
              </label>

              {mode === "weight" ? (
                <label className={styles.field}>
                  <span>Вес, т</span>
                  <input
                    type="number"
                    step="0.1"
                    value={weightTons}
                    onChange={(e) => setWeightTons(Number(e.target.value))}
                  />
                </label>
              ) : (
                <label className={styles.field}>
                  <span>Часы, ч</span>
                  <input type="number" step="1" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
                </label>
              )}
            </div>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>{mode === "weight" ? "Ставка работ, €/т" : "Ставка, €/ч"}</span>
                {mode === "weight" ? (
                  <input type="number" step="1" value={ratePerTon} onChange={(e) => setRatePerTon(Number(e.target.value))} />
                ) : (
                  <input type="number" step="1" value={ratePerHour} onChange={(e) => setRatePerHour(Number(e.target.value))} />
                )}
              </label>

              <label className={styles.field}>
                <span>Металл</span>
                <select value={steelSupply} onChange={(e) => setSteelSupply(e.target.value as SteelSupply)}>
                  <option value="client">Предоставляет заказчик</option>
                  <option value="akweld">Закупает AKWELD</option>
                </select>
              </label>
            </div>

            {steelSupply === "akweld" && (
              <div className={styles.row2}>
                <label className={styles.field}>
                  <span>Цена металла, €/т (ориентир)</span>
                  <input
                    type="number"
                    step="1"
                    value={steelPricePerTon}
                    onChange={(e) => setSteelPricePerTon(Number(e.target.value))}
                  />
                </label>
                <label className={styles.field}>
                  <span>Наценка/логистика, %</span>
                  <input
                    type="number"
                    step="1"
                    value={steelMarkupPct}
                    onChange={(e) => setSteelMarkupPct(Number(e.target.value))}
                  />
                </label>
              </div>
            )}
          </div>

          <div className={styles.block}>
            <h2 className={styles.h2}>Требования (влияют на цену)</h2>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Точность / рихтовка</span>
                <select value={tolerances} onChange={(e) => setTolerances(e.target.value as Complexity)}>
                  <option value="standard">Стандарт</option>
                  <option value="precision">Повышенная точность (подгонка/контроль)</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Контроль сварных соединений</span>
                <select value={ndt} onChange={(e) => setNdt(e.target.value as any)}>
                  <option value="none">Нет</option>
                  <option value="vt">VT (визуальный)</option>
                  <option value="mt">MT (магнитопорошковый)</option>
                  <option value="ut">UT (ультразвук)</option>
                </select>
              </label>
            </div>

            <div className={styles.row2}>
              <label className={styles.field}>
                <span>Подготовка поверхности</span>
                <select value={surfacePrep} onChange={(e) => setSurfacePrep(e.target.value as any)}>
                  <option value="none">Нет</option>
                  <option value="brush">Мех. зачистка</option>
                  <option value="sa2_5">Дробеструй Sa 2.5</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Покрытие</span>
                <select value={coating} onChange={(e) => setCoating(e.target.value as any)}>
                  <option value="none">Нет</option>
                  <option value="primer">Грунт</option>
                  <option value="paint">Окраска</option>
                  <option value="galv">Горячее цинкование</option>
                </select>
              </label>
            </div>

            <div className={styles.checks}>
              <label className={styles.chk}>
                <input type="checkbox" checked={designSupport} onChange={(e) => setDesignSupport(e.target.checked)} />
                <span>Инженерная поддержка (КМ/КМД, уточнение узлов)</span>
              </label>

              <label className={styles.chk}>
                <input type="checkbox" checked={qaDocs} onChange={(e) => setQaDocs(e.target.checked)} />
                <span>Документация (WPS/отчёты/паспорта/маркировка)</span>
              </label>

              <label className={styles.chk}>
                <input type="checkbox" checked={transport} onChange={(e) => setTransport(e.target.checked)} />
                <span>Организация доставки</span>
              </label>

              <label className={styles.chk}>
                <input type="checkbox" checked={lifting} onChange={(e) => setLifting(e.target.checked)} />
                <span>Краны/такелаж</span>
              </label>

              <label className={styles.chk}>
                <input type="checkbox" checked={siteInstallation} onChange={(e) => setSiteInstallation(e.target.checked)} />
                <span>Монтаж на объекте</span>
              </label>

              <label className={styles.chk}>
                <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} />
                <span>Экспресс (сжатые сроки / приоритет)</span>
              </label>
            </div>

            <label className={styles.field}>
              <span>Описание (габариты, допуски, вес, чертежи, сроки, требования)</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Например: балки 12 м, допуск 2 мм, покраска RAL..., контроль MT 10%..." />
            </label>
          </div>

          <div className={styles.block}>
            <h2 className={styles.h2}>Оценка</h2>

            <div className={styles.kpi}>
              <div className={styles.kpiItem}>
                <div className={styles.kpiLabel}>База</div>
                <div className={styles.kpiValue}>{money(calc.base)}</div>
              </div>
              <div className={styles.kpiItem}>
                <div className={styles.kpiLabel}>Металл</div>
                <div className={styles.kpiValue}>{money(calc.steelCost)}</div>
              </div>
              <div className={styles.kpiItem}>
                <div className={styles.kpiLabel}>Итого (ориентир)</div>
                <div className={styles.kpiValueStrong}>{money(calc.total)}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primary}
                onClick={handleSubmit}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Отправляем..." : "Сформировать запрос"}
              </button>
              <button className={styles.secondary} onClick={copyText} type="button">
                Скопировать текст
              </button>
            </div>

            {serverMsg && (
              <div className={status === "error" ? styles.msgErr : styles.msgOk}>
                {serverMsg}
              </div>
            )}

            <div className={styles.preview}>
              <div className={styles.previewTitle}>Текст заявки (можно отправить заказчику/менеджеру)</div>
              <textarea readOnly value={requestText} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
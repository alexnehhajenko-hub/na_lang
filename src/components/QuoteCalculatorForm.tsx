"use client";

import { useMemo, useState } from "react";
import styles from "./QuoteCalculatorForm.module.css";

type PricingModel = "weight" | "hours" | "hybrid";

type NdtMethod = "none" | "vt" | "mt" | "pt" | "ut" | "rt";
type Percent = 0 | 10 | 25 | 50 | 100;

type SurfacePrep = "st2" | "sa25";
type CoatingSystem = "none" | "primer" | "c2" | "c3" | "c4" | "c5" | "galv" | "fire";

type Delivery = "pickup" | "akweld";
type Urgency = "standard" | "rush" | "superrush";

type FormState = {
  // контакт
  company: string;
  person: string;
  email: string;
  phone: string;
  location: string;

  // база
  pricingModel: PricingModel;
  weightKg: string;
  hours: string;

  drawings: "yes" | "partial" | "no";
  material: "s235" | "s355" | "stainless" | "aluminium";
  qty: "1-5" | "6-20" | "20+";
  dimensions: string;

  // сложность/точность (галочки)
  tightTolerances: boolean;
  precisionFit: boolean;
  straightening: boolean;
  trialFit: boolean;
  manyParts: boolean;

  // стандарты/контроль
  exc: "exc1" | "exc2" | "exc3" | "exc4";
  iso5817: "d" | "c" | "b";

  ndtMethod: NdtMethod;
  ndtPercent: Percent;

  // покрытие
  surfacePrep: SurfacePrep;
  coating: CoatingSystem;
  dft: "80" | "120" | "160" | "240";
  ral: string;

  // логистика/сроки
  delivery: Delivery;
  oversize: boolean;
  urgency: Urgency;

  // описание
  description: string;
};

const CONFIG = {
  currency: "EUR",

  // ===== БАЗОВЫЕ СТАВКИ (поставишь свои) =====
  rateEurPerKg: {
    s235: 3.2,
    s355: 3.5,
    stainless: 8.0,
    aluminium: 7.0,
  },
  rateEurPerHour: {
    fabrication: 45,
  },

  // Покраска/покрытие (ориентиры)
  coatingEurPerM2: {
    none: 0,
    primer: 6,
    c2: 10,
    c3: 14,
    c4: 18,
    c5: 24,
    galv: 22,
    fire: 28,
  },

  // Поверхность: St2 / Sa2.5 (коэффициенты к покрытию)
  surfacePrepFactor: {
    st2: 1.0,
    sa25: 1.25,
  },

  // DFT коэффициент
  dftFactor: {
    "80": 1.0,
    "120": 1.15,
    "160": 1.30,
    "240": 1.55,
  },

  // NDT ставки (очень грубо; лучше позже уточнить)
  ndtBaseEur: {
    none: 0,
    vt: 0.5,
    mt: 1.8,
    pt: 2.0,
    ut: 3.5,
    rt: 6.0,
  },

  // Сложность — коэффициенты
  complexity: {
    tightTolerances: 0.20,
    precisionFit: 0.20,
    straightening: 0.20,
    trialFit: 0.25,
    manyParts: 0.15,
  },

  // EXC коэффициенты
  excFactor: {
    exc1: 1.0,
    exc2: 1.08,
    exc3: 1.18,
    exc4: 1.30,
  },

  // ISO 5817 коэффициенты
  isoFactor: {
    d: 1.0,
    c: 1.05,
    b: 1.12,
  },

  // Срочность
  urgencyFactor: {
    standard: 1.0,
    rush: 1.15,
    superrush: 1.30,
  },

  // Логистика (ориентиры)
  deliveryEur: {
    pickup: 0,
    akweld: 250,
  },
  oversizeEur: 350,

  // Площадь окраски из веса (очень грубая оценка для сайта)
  // Для типовых конструкций часто 25–45 м² на 1 тонну. Возьмём 35 м²/т.
  paintAreaM2PerTon: 35,
};

function toNum(v: string): number {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(x: number): string {
  const v = Math.round(x);
  return `${v.toLocaleString("ru-RU")} ${CONFIG.currency}`;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export default function QuoteCalculatorForm() {
  const [state, setState] = useState<FormState>({
    company: "",
    person: "",
    email: "",
    phone: "",
    location: "",

    pricingModel: "hybrid",
    weightKg: "",
    hours: "",

    drawings: "yes",
    material: "s355",
    qty: "1-5",
    dimensions: "",

    tightTolerances: false,
    precisionFit: false,
    straightening: false,
    trialFit: false,
    manyParts: false,

    exc: "exc2",
    iso5817: "c",

    ndtMethod: "none",
    ndtPercent: 0,

    surfacePrep: "st2",
    coating: "none",
    dft: "120",
    ral: "",

    delivery: "pickup",
    oversize: false,
    urgency: "standard",

    description: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function patch<K extends keyof FormState>(k: K, v: FormState[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  const calc = useMemo(() => {
    const weightKg = toNum(state.weightKg);
    const hours = toNum(state.hours);

    // сложность
    const complexityAdd =
      (state.tightTolerances ? CONFIG.complexity.tightTolerances : 0) +
      (state.precisionFit ? CONFIG.complexity.precisionFit : 0) +
      (state.straightening ? CONFIG.complexity.straightening : 0) +
      (state.trialFit ? CONFIG.complexity.trialFit : 0) +
      (state.manyParts ? CONFIG.complexity.manyParts : 0);

    const complexityFactor = 1 + complexityAdd;

    const excFactor = CONFIG.excFactor[state.exc];
    const isoFactor = CONFIG.isoFactor[state.iso5817];
    const urgencyFactor = CONFIG.urgencyFactor[state.urgency];

    const techFactor = complexityFactor * excFactor * isoFactor * urgencyFactor;

    // изготовление по весу
    const rateKg = CONFIG.rateEurPerKg[state.material];
    const fabricationByWeight = weightKg * rateKg * techFactor;

    // изготовление по часам
    const rateH = CONFIG.rateEurPerHour.fabrication;
    // часовую оценку тоже усиливаем, но “сложность” уже внутри времени — поэтому берём чуть мягче:
    const hourFactor = (1 + complexityAdd * 0.6) * excFactor * isoFactor * urgencyFactor;
    const fabricationByHours = hours * rateH * hourFactor;

    // оценка площади для покраски (если выбрано покрытие)
    const tons = weightKg / 1000;
    const paintAreaM2 = tons * CONFIG.paintAreaM2PerTon;
    const coatingRate = CONFIG.coatingEurPerM2[state.coating];
    const surfaceF = CONFIG.surfacePrepFactor[state.surfacePrep];
    const dftF = CONFIG.dftFactor[state.dft];
    const coatingCost = paintAreaM2 * coatingRate * surfaceF * dftF;

    // NDT (упрощённо): базовая ставка * вес(в т) * %/100
    const ndtBase = CONFIG.ndtBaseEur[state.ndtMethod];
    const ndtPct = clamp01(state.ndtPercent / 100);
    const ndtCost = ndtBase * tons * 1000 * ndtPct; // умножаем на 1000 чтобы было ощутимо (как “объём”)
    // (потом заменим на расчёт по метражу швов/кол-ву соединений)

    // логистика
    const deliveryCost = CONFIG.deliveryEur[state.delivery] + (state.oversize ? CONFIG.oversizeEur : 0);

    const baseByWeight = fabricationByWeight + coatingCost + ndtCost + deliveryCost;
    const baseByHours = fabricationByHours + coatingCost + ndtCost + deliveryCost;

    let recommended: "weight" | "hours" | "hybrid" = "hybrid";
    // авто-рекомендация: 2+ сложных галочки => часы
    const flagsCount =
      (state.tightTolerances ? 1 : 0) +
      (state.precisionFit ? 1 : 0) +
      (state.straightening ? 1 : 0) +
      (state.trialFit ? 1 : 0) +
      (state.manyParts ? 1 : 0);
    if (flagsCount >= 2) recommended = "hours";
    else recommended = "weight";

    // итог по выбранной модели
    let total = 0;
    if (state.pricingModel === "weight") total = baseByWeight;
    if (state.pricingModel === "hours") total = baseByHours;
    if (state.pricingModel === "hybrid") total = Math.max(baseByWeight, baseByHours);

    return {
      weightKg,
      hours,
      complexityFactor,
      techFactor,
      fabricationByWeight,
      fabricationByHours,
      coatingCost,
      ndtCost,
      deliveryCost,
      baseByWeight,
      baseByHours,
      total,
      recommended,
      flagsCount,
      paintAreaM2,
    };
  }, [state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang: "ru",
          ...state,
          estimate: {
            totalEur: Math.round(calc.total),
            totalText: fmtMoney(calc.total),
            breakdown: {
              fabricationByWeight: Math.round(calc.fabricationByWeight),
              fabricationByHours: Math.round(calc.fabricationByHours),
              coating: Math.round(calc.coatingCost),
              ndt: Math.round(calc.ndtCost),
              delivery: Math.round(calc.deliveryCost),
            },
          },
        }),
      });
      if (!res.ok) throw new Error("bad_response");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Запросить цену (под ключ)</h1>
        <p className={styles.subtitle}>
          Изготовление → организация контроля → покраска → упаковка → отправка. <br />
          Ниже — ориентировочный расчёт. Финальная цена подтверждается после просмотра чертежей.
        </p>
      </div>

      {status === "sent" ? (
        <div className={styles.success}>
          <div className={styles.successTitle}>Заявка отправлена</div>
          <div className={styles.successText}>
            Спасибо! Мы получили запрос и свяжемся с вами в ближайшее время.
          </div>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Контакты</div>

              <label className={styles.label}>
                Компания
                <input className={styles.input} value={state.company} onChange={(e) => patch("company", e.target.value)} />
              </label>

              <label className={styles.label}>
                Контактное лицо
                <input className={styles.input} value={state.person} onChange={(e) => patch("person", e.target.value)} />
              </label>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  Email *
                  <input className={styles.input} type="email" required value={state.email} onChange={(e) => patch("email", e.target.value)} />
                </label>

                <label className={styles.label}>
                  Телефон / WhatsApp
                  <input className={styles.input} value={state.phone} onChange={(e) => patch("phone", e.target.value)} />
                </label>
              </div>

              <label className={styles.label}>
                Локация проекта (страна/город)
                <input className={styles.input} value={state.location} onChange={(e) => patch("location", e.target.value)} />
              </label>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Модель расчёта</div>

              <label className={styles.label}>
                Как считать
                <select className={styles.select} value={state.pricingModel} onChange={(e) => patch("pricingModel", e.target.value as PricingModel)}>
                  <option value="hybrid">Гибрид (авто) — надёжнее</option>
                  <option value="weight">По весу (€/кг) — стандарт</option>
                  <option value="hours">По часам (€/час) — точные/сложные</option>
                </select>
              </label>

              <div className={styles.hint}>
                Рекомендация: <b>{calc.recommended === "hours" ? "по часам" : "по весу"}</b>{" "}
                (сложность отмечено: <b>{calc.flagsCount}</b>)
              </div>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  Вес (кг)
                  <input className={styles.input} value={state.weightKg} onChange={(e) => patch("weightKg", e.target.value)} placeholder="например 1200" />
                </label>

                <label className={styles.label}>
                  Часы (если знаете)
                  <input className={styles.input} value={state.hours} onChange={(e) => patch("hours", e.target.value)} placeholder="например 60" />
                </label>
              </div>

              <label className={styles.label}>
                Габариты max (L×W×H)
                <input className={styles.input} value={state.dimensions} onChange={(e) => patch("dimensions", e.target.value)} placeholder="например 6.0×2.2×2.5 м" />
              </label>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  Чертежи
                  <select className={styles.select} value={state.drawings} onChange={(e) => patch("drawings", e.target.value as any)}>
                    <option value="yes">Есть (PDF/DWG)</option>
                    <option value="partial">Частично</option>
                    <option value="no">Нет (нужны замеры/проектирование)</option>
                  </select>
                </label>

                <label className={styles.label}>
                  Количество позиций
                  <select className={styles.select} value={state.qty} onChange={(e) => patch("qty", e.target.value as any)}>
                    <option value="1-5">1–5</option>
                    <option value="6-20">6–20</option>
                    <option value="20+">20+</option>
                  </select>
                </label>
              </div>

              <label className={styles.label}>
                Материал
                <select className={styles.select} value={state.material} onChange={(e) => patch("material", e.target.value as any)}>
                  <option value="s235">S235 (углеродистая)</option>
                  <option value="s355">S355 (углеродистая)</option>
                  <option value="stainless">Нержавейка</option>
                  <option value="aluminium">Алюминий</option>
                </select>
              </label>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Точность и сложность</div>

              <label className={styles.check}>
                <input type="checkbox" checked={state.tightTolerances} onChange={(e) => patch("tightTolerances", e.target.checked)} />
                Жёсткие допуски / высокая точность (±1–2 мм)
              </label>

              <label className={styles.check}>
                <input type="checkbox" checked={state.precisionFit} onChange={(e) => patch("precisionFit", e.target.checked)} />
                Подгонка “в размер” / стыковка с существующим
              </label>

              <label className={styles.check}>
                <input type="checkbox" checked={state.straightening} onChange={(e) => patch("straightening", e.target.checked)} />
                Ожидается рихтовка / выведение геометрии
              </label>

              <label className={styles.check}>
                <input type="checkbox" checked={state.trialFit} onChange={(e) => patch("trialFit", e.target.checked)} />
                Нужна примерка/сборка в цеху (trial fit)
              </label>

              <label className={styles.check}>
                <input type="checkbox" checked={state.manyParts} onChange={(e) => patch("manyParts", e.target.checked)} />
                Много деталей / сложные узлы
              </label>

              <div className={styles.hint}>
                Коэффициент сложности: <b>{calc.complexityFactor.toFixed(2)}</b>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Стандарты и контроль</div>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  EN 1090 (EXC)
                  <select className={styles.select} value={state.exc} onChange={(e) => patch("exc", e.target.value as any)}>
                    <option value="exc1">EXC1</option>
                    <option value="exc2">EXC2</option>
                    <option value="exc3">EXC3</option>
                    <option value="exc4">EXC4</option>
                  </select>
                </label>

                <label className={styles.label}>
                  ISO 5817 (качество)
                  <select className={styles.select} value={state.iso5817} onChange={(e) => patch("iso5817", e.target.value as any)}>
                    <option value="d">D</option>
                    <option value="c">C</option>
                    <option value="b">B</option>
                  </select>
                </label>
              </div>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  NDT метод
                  <select className={styles.select} value={state.ndtMethod} onChange={(e) => patch("ndtMethod", e.target.value as NdtMethod)}>
                    <option value="none">Нет / только визуальный</option>
                    <option value="vt">VT</option>
                    <option value="mt">MT</option>
                    <option value="pt">PT</option>
                    <option value="ut">UT</option>
                    <option value="rt">RT</option>
                  </select>
                </label>

                <label className={styles.label}>
                  % контроля
                  <select className={styles.select} value={String(state.ndtPercent)} onChange={(e) => patch("ndtPercent", Number(e.target.value) as Percent)}>
                    <option value="0">0%</option>
                    <option value="10">10%</option>
                    <option value="25">25%</option>
                    <option value="50">50%</option>
                    <option value="100">100%</option>
                  </select>
                </label>
              </div>

              <div className={styles.hint}>
                Тех. коэффициент (EXC×ISO×срочность×сложность): <b>{calc.techFactor.toFixed(2)}</b>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Покраска / защита</div>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  Подготовка поверхности
                  <select className={styles.select} value={state.surfacePrep} onChange={(e) => patch("surfacePrep", e.target.value as SurfacePrep)}>
                    <option value="st2">St2</option>
                    <option value="sa25">Sa 2.5</option>
                  </select>
                </label>

                <label className={styles.label}>
                  Покрытие
                  <select className={styles.select} value={state.coating} onChange={(e) => patch("coating", e.target.value as CoatingSystem)}>
                    <option value="none">Без покрытия</option>
                    <option value="primer">Грунт</option>
                    <option value="c2">C2</option>
                    <option value="c3">C3</option>
                    <option value="c4">C4</option>
                    <option value="c5">C5</option>
                    <option value="galv">Горячее цинкование</option>
                    <option value="fire">Огнезащита</option>
                  </select>
                </label>
              </div>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  DFT (мкм)
                  <select className={styles.select} value={state.dft} onChange={(e) => patch("dft", e.target.value as any)}>
                    <option value="80">80</option>
                    <option value="120">120</option>
                    <option value="160">160</option>
                    <option value="240">240</option>
                  </select>
                </label>

                <label className={styles.label}>
                  RAL (если нужен)
                  <input className={styles.input} value={state.ral} onChange={(e) => patch("ral", e.target.value)} placeholder="например RAL 7016" />
                </label>
              </div>

              <div className={styles.hint}>
                Оценка площади под покраску: <b>{Math.round(calc.paintAreaM2)} м²</b> (ориентир по весу)
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Логистика и сроки</div>

              <label className={styles.label}>
                Доставка
                <select className={styles.select} value={state.delivery} onChange={(e) => patch("delivery", e.target.value as Delivery)}>
                  <option value="pickup">Самовывоз / клиент организует</option>
                  <option value="akweld">AKWELD организует доставку</option>
                </select>
              </label>

              <label className={styles.check}>
                <input type="checkbox" checked={state.oversize} onChange={(e) => patch("oversize", e.target.checked)} />
                Негабарит / требуется спецтранспорт
              </label>

              <label className={styles.label}>
                Срочность
                <select className={styles.select} value={state.urgency} onChange={(e) => patch("urgency", e.target.value as Urgency)}>
                  <option value="standard">Стандарт</option>
                  <option value="rush">Срочно (1–2 недели)</option>
                  <option value="superrush">Очень срочно (&lt; 1 недели)</option>
                </select>
              </label>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Описание / ссылки</div>

              <label className={styles.label}>
                Опишите задачу (что изготовить, где монтировать, ссылки на чертежи)
                <textarea className={styles.textarea} rows={7} value={state.description} onChange={(e) => patch("description", e.target.value)} />
              </label>

              <div className={styles.small}>
                Можно вставить ссылку на Drive/Dropbox и указать сроки. Мы уточним вопросы и сделаем точное предложение.
              </div>
            </div>
          </div>

          <div className={styles.result}>
            <div className={styles.resultTop}>
              <div>
                <div className={styles.resultTitle}>Ориентировочная оценка</div>
                <div className={styles.resultNote}>
                  Для сайта это “estimate”. Финальная цена зависит от чертежей, объёма NDT, системы покраски и допусков.
                </div>
              </div>
              <div className={styles.total}>{fmtMoney(calc.total)}</div>
            </div>

            <div className={styles.breakdown}>
              <div className={styles.line}>
                <span>Изготовление (по весу)</span>
                <b>{fmtMoney(calc.fabricationByWeight)}</b>
              </div>
              <div className={styles.line}>
                <span>Изготовление (по часам)</span>
                <b>{fmtMoney(calc.fabricationByHours)}</b>
              </div>
              <div className={styles.line}>
                <span>Покраска / покрытие</span>
                <b>{fmtMoney(calc.coatingCost)}</b>
              </div>
              <div className={styles.line}>
                <span>Контроль / NDT</span>
                <b>{fmtMoney(calc.ndtCost)}</b>
              </div>
              <div className={styles.line}>
                <span>Логистика</span>
                <b>{fmtMoney(calc.deliveryCost)}</b>
              </div>
            </div>
          </div>

          {status === "error" && (
            <div className={styles.error}>
              Не удалось отправить. Попробуйте ещё раз или напишите нам напрямую на email.
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Отправляем…" : "Отправить запрос"}
            </button>
          </div>

          <div className={styles.small}>
            Админ-настройки ставок находятся вверху файла <b>QuoteCalculatorForm.tsx</b> (CONFIG).
          </div>
        </form>
      )}
    </div>
  );
}

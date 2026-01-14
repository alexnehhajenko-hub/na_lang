"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

function getLocaleFromPath(pathname: string): string {
  // ожидаем /ru/..., /en/..., /sv/..., etc.
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return "en";
  // защита: locale обычно 2 буквы, но пусть будет как есть
  return seg.toLowerCase();
}

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const locale = getLocaleFromPath(pathname);

  const quoteHref = `/${locale}/quote`;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
        }}
      >
        {/* Brand */}
        <Link
          href={`/${locale}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              overflow: "hidden",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              flex: "0 0 auto",
            }}
          >
            <Image
              src="/akweld-emblem.png.PNG"
              alt="AKWELD"
              width={34}
              height={34}
              priority
            />
          </span>

          <span
            style={{
              fontWeight: 800,
              letterSpacing: 1,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            AKWELD
          </span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* One language dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSwitcher />

          {/* CTA */}
          <Link
            href={quoteHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 700,
              color: "rgba(20,16,6,0.95)",
              background: "linear-gradient(180deg, #b49232 0%, #8a6b1d 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {locale === "ru" ? "Запросить цену" : "Get a quote"}
          </Link>
        </div>
      </div>
    </header>
  );
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Пока просто логируем (в Vercel Logs будет видно)
    console.log("QUOTE_REQUEST", {
      createdAt: body?.createdAt,
      locale: body?.locale,
      name: body?.name,
      company: body?.company,
      phone: body?.phone,
      email: body?.email,
      estimateEur: body?.estimateEur,
    });

    // Можно также логировать полный текст:
    // console.log(body?.requestText);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Bad request" },
      { status: 400 }
    );
  }
}
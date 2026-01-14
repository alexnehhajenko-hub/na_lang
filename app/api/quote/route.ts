export const runtime = "nodejs";

function isEmail(v: unknown) {
  return typeof v === "string" && v.includes("@") && v.length < 200;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!isEmail(body?.email)) {
      return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    console.log("QUOTE_REQUEST", JSON.stringify(body).slice(0, 20000));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

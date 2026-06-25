import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp, isSameOrigin, stripControlChars } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Newsletter subscribe endpoint — provider-ready but not yet wired to a form
 * (the site currently links to the LinkedIn newsletter). Supports ConvertKit/Kit
 * out of the box; falls back to logging until credentials are configured.
 *
 * Env to enable Kit:  KIT_API_KEY, KIT_FORM_ID
 */
const SubscribeSchema = z.object({
  email: z.string().trim().min(3).max(200).email().transform(stripControlChars),
  name: z.string().trim().max(100).optional().transform((v) => (v ? stripControlChars(v) : v)),
  _gotcha: z.string().max(0).optional().or(z.literal("")),
});

function reject(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return reject(403, "Request origin not allowed.");
  if (!(request.headers.get("content-type") || "").includes("application/json")) {
    return reject(415, "Unsupported content type.");
  }

  const ip = getClientIp(request);
  const { success } = await rateLimit(`newsletter:${ip}`);
  if (!success) return reject(429, "Too many requests. Please try again shortly.");

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 5_000) return reject(413, "Payload too large.");
    raw = JSON.parse(text);
  } catch {
    return reject(400, "Invalid JSON.");
  }

  const parsed = SubscribeSchema.safeParse(raw);
  if (!parsed.success) return reject(422, "Please enter a valid email address.");
  const { email, name, _gotcha } = parsed.data;
  if (_gotcha) return NextResponse.json({ ok: true }); // honeypot

  const kitKey = process.env.KIT_API_KEY;
  const kitForm = process.env.KIT_FORM_ID;

  if (!kitKey || !kitForm) {
    console.warn("[newsletter] Kit not configured — logging subscriber.", { email, name });
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${kitForm}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: kitKey, email, first_name: name }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[newsletter] Kit error:", res.status);
      return reject(502, "Could not subscribe right now. Please try again later.");
    }
  } catch (err) {
    console.error("[newsletter] Unexpected error:", err);
    return reject(500, "Something went wrong. Please try again later.");
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return reject(405, "Method not allowed.");
}

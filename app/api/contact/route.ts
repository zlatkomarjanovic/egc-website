import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import {
  escapeHtml,
  getClientIp,
  isSameOrigin,
  stripControlChars,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strict, length-capped schema. Single-line fields also reject control chars.
const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).transform(stripControlChars),
  email: z.string().trim().min(3).max(200).email("Invalid email").transform(stripControlChars),
  subject: z.string().trim().min(1, "Subject is required").max(150).transform(stripControlChars),
  message: z.string().trim().min(1, "Message is required").max(5000),
  // Anti-spam fields injected by the client enhancer.
  _gotcha: z.string().max(0).optional().or(z.literal("")),
  _ts: z.coerce.number().optional(),
});

function reject(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  // 1) CSRF: only accept posts from our own origin.
  if (!isSameOrigin(request)) {
    return reject(403, "Request origin not allowed.");
  }

  // 2) Content-type guard.
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return reject(415, "Unsupported content type.");
  }

  // 3) Rate limit per IP.
  const ip = getClientIp(request);
  const { success } = await rateLimit(`contact:${ip}`);
  if (!success) {
    return reject(429, "Too many requests. Please try again in a minute.");
  }

  // 4) Parse & validate body (cap payload size).
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > 20_000) return reject(413, "Payload too large.");
    raw = JSON.parse(text);
  } catch {
    return reject(400, "Invalid JSON.");
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return reject(422, "Please check the form and try again.");
  }
  const { name, email, subject, message, _gotcha, _ts } = parsed.data;

  // 5) Honeypot + timing checks (silently accept to not tip off bots).
  const looksLikeBot =
    (_gotcha && _gotcha.length > 0) ||
    (typeof _ts === "number" && Date.now() - _ts < 1500);
  if (looksLikeBot) {
    return NextResponse.json({ ok: true });
  }

  // 6) Deliver.
  const to = process.env.CONTACT_TO_EMAIL || "info@egcnyc.org";
  const from = process.env.CONTACT_FROM_EMAIL || "EGC Website <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, "<br>"),
  };

  if (!apiKey) {
    // Not configured yet: don't lose the message — log it and report success so
    // the live form keeps working. Set RESEND_API_KEY in Vercel to enable email.
    console.warn(
      "[contact] RESEND_API_KEY not set — logging submission instead of emailing.",
      { name, email, subject, message }
    );
    return NextResponse.json({ ok: true });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[EGC Contact] ${subject}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${safe.name}</p>
        <p><strong>Email:</strong> ${safe.email}</p>
        <p><strong>Subject:</strong> ${safe.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${safe.message}</p>
      `,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return reject(502, "Could not send your message. Please try again later.");
    }
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return reject(500, "Something went wrong. Please try again later.");
  }

  return NextResponse.json({ ok: true });
}

// Reject other methods explicitly.
export async function GET() {
  return reject(405, "Method not allowed.");
}

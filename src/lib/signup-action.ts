"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { signupEmailHtml, signupEmailText } from "@/lib/signup-email";

const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

export async function signupAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  if (formData.get("company")) {
    return { ok: true };
  }

  const email = formData.get("email");
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = formData.get("cf-turnstile-response");
    if (!token || typeof token !== "string") {
      return { ok: false, error: "Please complete the verification." };
    }
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: turnstileSecret, response: token }),
      }
    );
    const result = await res.json();
    if (!result.success) {
      return { ok: false, error: "Verification failed. Please try again." };
    }
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return { ok: false, error: "Too many signups. Please try again later." };
  }

  const supabase = await createServiceClient();
  await supabase.from("signups").insert({ email });

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const logoUrl = `${siteUrl}/fortune-creative-logo-black.png`;

    await resend.emails.send({
      from:
        process.env.SIGNUP_FROM ??
        "Fortune Creative Website <website@fortunecreative.com>",
      to:
        process.env.SIGNUP_NOTIFY_TO ?? "dan@fortunecreative.com",
      subject: `New release list signup: ${email}`,
      html: signupEmailHtml(email, logoUrl),
      text: signupEmailText(email),
    });
  }

  return { ok: true };
}

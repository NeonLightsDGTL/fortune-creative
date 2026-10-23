"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-admin-bg px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] flex flex-col gap-6 p-8 bg-white border border-border"
      >
        <div className="flex flex-col gap-2 items-center">
          <img
            src="/fortune-creative-logo-black.png"
            alt="Fortune Creative"
            className="w-[200px] h-auto"
          />
          <p className="text-[14px] text-secondary">Admin login</p>
        </div>

        {error && (
          <p role="alert" className="m-0 text-[14px] text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[12px] font-semibold tracking-[0.14em] uppercase"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[44px] px-3 border border-ink bg-white text-ink text-[15px] font-sans focus:outline-2 focus:outline-accent focus:outline-offset-1"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-[12px] font-semibold tracking-[0.14em] uppercase"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[44px] px-3 border border-ink bg-white text-ink text-[15px] font-sans focus:outline-2 focus:outline-accent focus:outline-offset-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-[44px] bg-ink text-white text-[14px] font-semibold border-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

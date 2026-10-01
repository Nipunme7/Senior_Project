"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase env vars are missing. Add them to frontend/.env.");
      setPending(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          throw signUpError;
        }
        setMessage("Account created. If email confirmation is on, confirm then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw signInError;
        }
        router.push("/owner/media");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] px-6 py-20 text-[#f4f1ea]">
      <div className="mx-auto max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C9A45C]">Owner</p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-4 text-sm text-[#cfc9bb]">
          Phase 6 media uploads require a Supabase Auth session so RLS can
          verify site ownership.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block text-sm">
            <span className="text-[#cfc9bb]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-[#C9A45C]"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[#cfc9bb]">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-white/20 bg-transparent px-3 py-2 outline-none focus:border-[#C9A45C]"
            />
          </label>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {message ? <p className="text-sm text-[#C9A45C]">{message}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full border border-[#C9A45C] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#C9A45C] transition hover:bg-[#C9A45C] hover:text-[#111111] disabled:opacity-50"
          >
            {pending ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          className="mt-6 text-sm text-[#cfc9bb] underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <p className="mt-10 text-sm">
          <Link href="/" className="text-[#C9A45C] underline">
            Back home
          </Link>
        </p>
      </div>
    </main>
  );
}

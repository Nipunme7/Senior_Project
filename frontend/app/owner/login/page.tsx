"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BuilderWireframe } from "@/components/owner/BuilderWireframe";
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
        setMessage(
          "Account created. If email confirmation is on, confirm then sign in.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw signInError;
        }
        router.push("/owner/create");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between border-r border-[#e2e8f0] bg-[#0f172a] px-10 py-10 text-[#e2e8f0] lg:flex">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-xl text-white"
            >
              SiteCraft
            </Link>
            <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5eead4]">
              Website builder
            </p>
            <h1 className="owner-heading-on-dark mt-4 max-w-sm text-4xl leading-tight">
              Sign in to your builder workspace.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-300">
              Configure sections, upload media, generate a structured site, then
              publish — all from one flow.
            </p>
          </div>
          <div className="mt-12">
            <BuilderWireframe className="opacity-95" />
          </div>
        </aside>

        <section className="flex flex-col justify-center px-6 py-12 sm:px-10">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="mb-10 inline-block font-[family-name:var(--font-display)] text-xl lg:hidden"
            >
              SiteCraft
            </Link>

            <div
              className="mb-8 grid grid-cols-2 border border-[#d7dde5] bg-white"
              role="tablist"
              aria-label="Auth mode"
            >
              {(
                [
                  { id: "signin", label: "Sign in" },
                  { id: "signup", label: "Create account" },
                ] as const
              ).map((tab) => {
                const selected = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setMode(tab.id);
                      setError(null);
                      setMessage(null);
                    }}
                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                      selected
                        ? "bg-[#0f172a] text-white"
                        : "text-[#475569] hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <h2 className="owner-heading text-3xl tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="owner-body-text mt-2 text-sm">
              {mode === "signin"
                ? "Continue where you left off in the builder."
                : "One account opens the full generate and publish flow."}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <label className="block text-sm font-medium text-[#1e293b]">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full border border-[#d7dde5] bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#0f766e]"
                />
              </label>
              <label className="block text-sm font-medium text-[#1e293b]">
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full border border-[#d7dde5] bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-[#0f766e]"
                />
              </label>

              {error ? (
                <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-[#0f172a] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0f766e] disabled:opacity-50"
              >
                {pending
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-sm owner-muted-text">
              <Link
                href="/"
                className="font-medium text-[#0f766e] underline underline-offset-4 hover:text-[#0d9488]"
              >
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

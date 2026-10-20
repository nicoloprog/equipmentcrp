"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await createClient().auth.signInWithPassword(
      { email, password },
    );
    if (signInError) setError(signInError.message);
    else router.push("/");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">
            Maintenance CRP
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">
            Connexion
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Autorisation nécessaire pour avoir accès.
          </p>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

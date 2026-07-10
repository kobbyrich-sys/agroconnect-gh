"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PortalRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? "Registration failed");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone,
      company,
      role: "customer",
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/">
            <img src="/logo.png" alt="Transdel" className="mx-auto h-12 w-auto" />
          </Link>
          <p className="mt-2 text-sm text-gray-500">Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input id="fullName" type="text" required value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input id="phone" type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700" />
            </div>
            <div>
              <label htmlFor="company" className="mb-1 block text-sm font-medium text-gray-700">Company</label>
              <input id="company" type="text" value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700" />
            </div>
          </div>

          {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={loading}
            className="mt-6 w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/portal/login" className="font-medium text-brand-700 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

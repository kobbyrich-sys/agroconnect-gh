"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, company")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setCompany(profile.company ?? "");
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, company, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully");
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500" />
          </div>
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input id="fullName" type="text" value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
        </div>

        {message && (
          <div className={`mt-4 rounded-lg p-3 text-sm ${
            message === "Profile updated successfully"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>{message}</div>
        )}

        <button type="submit" disabled={saving}
          className="mt-6 w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

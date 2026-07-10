"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

const services = [
  "CCTV Installation",
  "Access Control Systems",
  "Network Infrastructure",
  "Workstation Setup",
  "IT Support",
  "Preventive Maintenance",
];

export function QuotationForm({ defaultService }: { defaultService?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      company: form.get("company"),
      service_interest: form.get("service_interest"),
      project_details: form.get("project_details"),
      preferred_date: form.get("preferred_date"),
    };

    const res = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const { error: msg } = await res.json();
      setError(msg || "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="text-3xl">&#10003;</div>
        <h3 className="mt-4 text-lg font-semibold text-green-800">
          Quote Request Submitted!
        </h3>
        <p className="mt-2 text-green-600">
          We&apos;ll review your request and get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="mb-1 block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            id="q-name"
            name="name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="q-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            id="q-email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="q-phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone *
          </label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <div>
          <label htmlFor="q-company" className="mb-1 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            id="q-company"
            name="company"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
      </div>

      <div>
        <label htmlFor="q-service" className="mb-1 block text-sm font-medium text-gray-700">
          Service Interested In *
        </label>
        <select
          id="q-service"
          name="service_interest"
          required
          defaultValue={defaultService || ""}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        >
          <option value="" disabled>
            Select a service...
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="q-details" className="mb-1 block text-sm font-medium text-gray-700">
          Project Details *
        </label>
        <textarea
          id="q-details"
          name="project_details"
          required
          rows={4}
          placeholder="Describe your project, requirements, and any specific needs..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        />
      </div>

      <div>
        <label htmlFor="q-date" className="mb-1 block text-sm font-medium text-gray-700">
          Preferred Start Date
        </label>
        <input
          id="q-date"
          name="preferred_date"
          type="date"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" size="lg">
        Submit Quote Request
      </Button>
    </form>
  );
}

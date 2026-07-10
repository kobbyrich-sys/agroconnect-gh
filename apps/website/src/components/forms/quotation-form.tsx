"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

const services = [
  "Fresh Vegetables",
  "Fresh Fruits",
  "Grains & Cereals",
  "Livestock & Poultry",
  "Dairy Products",
  "Farming Equipment",
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
      company: form.get("farm_name"),
      category_interest: form.get("category_interest"),
      product_details: form.get("product_details"),
      region: form.get("region"),
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
          We&apos;ll review your request and get in touch within 24 hours.
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
          <label htmlFor="q-farm" className="mb-1 block text-sm font-medium text-gray-700">
            Farm / Business Name
          </label>
          <input
            id="q-farm"
            name="farm_name"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
      </div>

      <div>
        <label htmlFor="q-category" className="mb-1 block text-sm font-medium text-gray-700">
              Product Category *
        </label>
        <select
          id="q-category"
          name="category_interest"
          required
          defaultValue={defaultService || ""}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        >
          <option value="" disabled>
            Select a category...
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
            Products & Pricing *
        </label>
        <textarea
          id="q-details"
          name="product_details"
          required
          rows={4}
          placeholder="List the products, quantities, and pricing you offer..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        />
      </div>

      <div>
        <label htmlFor="q-region" className="mb-1 block text-sm font-medium text-gray-700">
            Region *
        </label>
        <select
          id="q-region"
          name="region"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
        >
          <option value="" disabled>Select a region...</option>
          <option>Greater Accra</option>
          <option>Ashanti</option>
          <option>Eastern</option>
          <option>Western</option>
          <option>Central</option>
          <option>Volta</option>
          <option>Northern</option>
          <option>Upper East</option>
          <option>Upper West</option>
          <option>Bono</option>
          <option>Bono East</option>
          <option>Ahafo</option>
          <option>Western North</option>
          <option>Oti</option>
          <option>North East</option>
          <option>Savannah</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" size="lg">
        Submit Partnership Request
      </Button>
    </form>
  );
}

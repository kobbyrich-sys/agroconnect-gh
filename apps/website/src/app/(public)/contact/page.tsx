"use client";

import Link from "next/link";
import { Section, SectionHeader, FadeIn, buttonVariants } from "@/components/ui";
import { ContactForm } from "@/components/forms";

export default function ContactPage() {
  return (
    <>
      <Section>
        <FadeIn>
          <SectionHeader
            title="Get in Touch"
            subtitle="Have a question or want to partner with us? We'd love to hear from you."
          />
        </FadeIn>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            <FadeIn direction="left" className="space-y-8 lg:col-span-2">
              {[
                  {
                    label: "Email",
                    value: "support@agroconnectgh.com",
                    href: "mailto:support@agroconnectgh.com",
                  },
                  {
                    label: "Phone",
                    value: "+233 50 123 4567",
                    href: "tel:+233501234567",
                  },
                  {
                    label: "Phone",
                    value: "+233 50 765 4321",
                    href: "tel:+233507654321",
                  },
                  {
                    label: "WhatsApp",
                    value: "Chat with us",
                    href: "https://wa.me/233501234567",
                  },
                  {
                    label: "Location",
                    value: "Accra, Ghana",
                  },
              ].map((c) => (
                <div key={c.label}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    {c.label}
                  </h3>
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="mt-1 block text-lg font-medium text-emerald-700 hover:underline"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-lg text-gray-700">{c.value}</p>
                  )}
                </div>
              ))}
            </FadeIn>

            <FadeIn direction="right" delay={0.1} className="lg:col-span-3">
              <h3 className="mb-6 text-xl font-semibold">
                Send Us a Message
              </h3>
              <ContactForm />
            </FadeIn>
          </div>
        </div>
      </Section>

      <Section dark>
        <FadeIn>
          <SectionHeader
            title="Sell on AgroConnect GH"
            subtitle="Tell us about your farm or business and we'll help you get started."
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-6 text-lg text-gray-600">
              Create a seller account to list your products and reach thousands of buyers across Ghana.
            </p>
            <Link href="/sell" className={buttonVariants({ size: "lg" })}>
              Start Selling
            </Link>
          </div>
        </FadeIn>
      </Section>
    </>
  );
}

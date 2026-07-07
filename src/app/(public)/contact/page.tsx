"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Section, SectionHeader, FadeIn } from "@/components/ui";
import { ContactForm, QuotationForm } from "@/components/forms";

const serviceNames: Record<string, string> = {
  "cctv-installation": "CCTV Installation",
  "access-control": "Access Control Systems",
  "network-infrastructure": "Network Infrastructure",
  "workstation-setup": "Workstation Setup",
  "it-support": "IT Support",
  "preventive-maintenance": "Preventive Maintenance",
};

function ContactContent() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");

  const defaultService = serviceParam ? serviceNames[serviceParam] : undefined;

  return (
    <>
      <Section>
        <FadeIn>
          <SectionHeader
            title="Get in Touch"
            subtitle="Have a project in mind? Reach out and we'll help you find the right solution."
          />
        </FadeIn>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            <FadeIn direction="left" className="space-y-8 lg:col-span-2">
              {[
                  {
                    label: "Email",
                    value: "transdelsetups@gmail.com",
                    href: "mailto:transdelsetups@gmail.com",
                  },
                  {
                    label: "Phone",
                    value: "+233 557 410 369",
                    href: "tel:+233557410369",
                  },
                  {
                    label: "Phone",
                    value: "+233 538 134 778",
                    href: "tel:+233538134778",
                  },
                  {
                    label: "WhatsApp",
                    value: "Chat with us",
                    href: "https://wa.me/233557410369",
                  },
                  {
                    label: "Location",
                    value: "Tema, Ghana",
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
                      className="mt-1 block text-lg font-medium text-brand-700 hover:underline"
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
            title="Request a Quotation"
            subtitle="Tell us about your project and we'll provide a detailed quote."
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mx-auto max-w-2xl">
            <QuotationForm defaultService={defaultService} />
          </div>
        </FadeIn>
      </Section>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}

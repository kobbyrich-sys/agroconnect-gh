"use client";

import Link from "next/link";
import { Section, FadeIn, buttonVariants } from "@/components/ui";

export function AboutPreview() {
  return (
    <Section dark>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <FadeIn direction="left">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Reliable Technology Partner for Ghana
            </h2>
            <p className="mt-6 leading-relaxed text-gray-300">
              With years of hands-on experience across Accra and beyond,
              Transdel Set-Up Services has built a reputation for delivering
              dependable security and IT solutions. We work with businesses,
              institutions, and homeowners to design, install, and maintain
              systems that perform.
            </p>
            <p className="mt-4 leading-relaxed text-gray-300">
              Every project is backed by our commitment to quality,
              transparency, and long-term support. We don&apos;t just install
              equipment — we build relationships.
            </p>
            <Link
              href="/about"
              className={buttonVariants({
                variant: "outline",
                className:
                  "mt-8 border-white text-white hover:bg-white hover:text-brand-800",
              })}
            >
              Learn More About Us
            </Link>
          </div>
        </FadeIn>
        <FadeIn direction="right" delay={0.2}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Years Experience", value: "10+" },
              { label: "Projects Completed", value: "500+" },
              { label: "Happy Clients", value: "300+" },
              { label: "Service Locations", value: "All Regions" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-700 bg-white/5 p-6 text-center transition-transform hover:scale-105"
              >
                <div className="text-3xl font-bold text-accent-400">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}

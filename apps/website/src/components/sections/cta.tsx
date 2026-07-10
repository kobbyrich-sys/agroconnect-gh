"use client";

import Link from "next/link";
import { Section, FadeIn, buttonVariants } from "@/components/ui";

export function CTA() {
  return (
    <Section className="text-center">
      <FadeIn>
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Start Trading?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of farmers and buyers on Ghana&apos;s fastest-growing agricultural marketplace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/sell"
              className={buttonVariants({ size: "lg" })}
            >
              Start Selling
            </Link>
            <Link
              href="/marketplace"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}

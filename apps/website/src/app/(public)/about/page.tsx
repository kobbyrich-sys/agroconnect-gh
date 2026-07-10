"use client";

import Image from "next/image";
import { Section, SectionHeader, FadeIn, Stagger, StaggerItem } from "@/components/ui";

const values = [
  {
    title: "Fresh From Farm",
    description:
      "We connect you directly with verified Ghanaian farmers — no middlemen, fair prices, and produce that was harvested days, not weeks ago.",
  },
  {
    title: "Trust & Transparency",
    description:
      "Every seller is verified with Ghana Card and business registration. Clear pricing, honest product descriptions, and secure transactions you can rely on.",
  },
  {
    title: "Supporting Local Agriculture",
    description:
      "We empower Ghanaian farmers, manufacturers, and wholesalers to reach more customers and grow their businesses across all 16 regions.",
  },
  {
    title: "Secure Escrow Payments",
    description:
      "Funds are held securely in escrow until you confirm receipt. Your money is protected — released to the seller only when you're satisfied.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn direction="left">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                About AgroConnect GH
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Ghana&apos;s trusted agricultural marketplace — connecting farmers, buyers, and businesses.
              </p>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-600">
                <p>
                  AgroConnect GH was built to solve a simple problem: Ghanaian farmers grow world-class produce, but too often struggle to find reliable buyers. Meanwhile, consumers and businesses want fresh, local food but don&apos;t know where to find it.
                </p>
                <p>
                  We bridge that gap with a digital marketplace that makes it easy to buy and sell agricultural products — from fresh vegetables and fruits to grains, livestock, and farming equipment.
                </p>
                <p>
                  Our platform serves all 16 regions of Ghana, supporting the entire agricultural value chain from farm to table.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn direction="right" delay={0.2}>
            <div className="overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"
                alt="AgroConnect GH - Ghanaian farm marketplace"
                width="800"
                height="450"
                className="h-auto w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </Section>

      <Section dark>
        <FadeIn>
          <SectionHeader title="Our Values" centered />
        </FadeIn>
        <Stagger className="grid gap-8 md:grid-cols-2">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="rounded-xl border border-gray-700 bg-white/5 p-6 transition-transform hover:scale-[1.02]">
                <h3 className="mb-3 text-xl font-semibold text-white">
                  {v.title}
                </h3>
                <p className="leading-relaxed text-gray-300">
                  {v.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section>
        <FadeIn>
          <SectionHeader title="Why Choose AgroConnect GH?" centered />
        </FadeIn>
        <div className="mx-auto max-w-3xl space-y-8">
          <Stagger>
            {[
              {
                title: "Verified Sellers",
                desc: "Every farmer and business on our platform is verified with valid identification and business registration.",
              },
              {
                title: "Fresh Produce",
                desc: "Buy directly from growers — shorter supply chains mean fresher food at better prices.",
              },
              {
                title: "Secure Payments",
                desc: "Our escrow system protects both buyers and sellers. Pay with confidence using Mobile Money, card, or bank transfer.",
              },
              {
                title: "Nationwide Reach",
                desc: "Connect with farmers and buyers across all 16 regions of Ghana. No location is too remote.",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="flex gap-4">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-700" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>
    </>
  );
}

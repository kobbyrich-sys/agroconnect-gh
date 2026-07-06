"use client";

import Link from "next/link";
import { Section, SectionHeader, FadeIn, Stagger, StaggerItem, buttonVariants } from "@/components/ui";

const services = [
  {
    slug: "cctv-installation",
    title: "CCTV Installation",
    description:
      "High-definition surveillance systems for homes, businesses, and institutions. We design and install custom CCTV solutions with remote monitoring, motion detection, and 24/7 recording capabilities.",
    features: [
      "HD and 4K camera systems",
      "Night vision and thermal imaging",
      "Remote viewing via mobile app",
      "Cloud and local storage options",
      "Motion detection and alerts",
      "Scalable for multi-site deployments",
    ],
  },
  {
    slug: "access-control",
    title: "Access Control Systems",
    description:
      "Secure your premises with biometric, card-based, and smart lock systems. Manage who enters your facility with granular permissions and real-time audit logs.",
    features: [
      "Biometric fingerprint and face recognition",
      "RFID card and fob systems",
      "Keypad and PIN entry",
      "Integration with existing security systems",
      "Remote access management",
      "Audit trail and reporting",
    ],
  },
  {
    slug: "network-infrastructure",
    title: "Network Infrastructure",
    description:
      "Structured cabling, WiFi deployment, and enterprise networking for reliable, high-speed connectivity. We build networks that scale with your business.",
    features: [
      "Structured cabling (Cat6, fiber optic)",
      "Enterprise WiFi deployment",
      "Router, switch, and firewall configuration",
      "VPN and remote access setup",
      "Network security and monitoring",
      "Bandwidth management and QoS",
    ],
  },
  {
    slug: "workstation-setup",
    title: "Workstation Setup",
    description:
      "End-to-end workstation deployment including hardware configuration, software installation, and ergonomic setup. Get your team productive from day one.",
    features: [
      "Hardware assembly and configuration",
      "OS and software installation",
      "Network and printer setup",
      "Email and account configuration",
      "Ergonomic assessment and setup",
      "Data migration from old systems",
    ],
  },
  {
    slug: "it-support",
    title: "IT Support",
    description:
      "On-site and remote IT support with fast response times and proactive system monitoring. We keep your technology running smoothly.",
    features: [
      "Remote and on-site support",
      "System health monitoring",
      "Virus and malware removal",
      "Hardware troubleshooting and repair",
      "Software updates and patch management",
      "Emergency response services",
    ],
  },
  {
    slug: "preventive-maintenance",
    title: "Preventive Maintenance",
    description:
      "Scheduled inspections and maintenance to keep your systems running reliably and extend equipment life. Reduce downtime and avoid costly repairs.",
    features: [
      "Quarterly system inspections",
      "Cleaning and calibration",
      "Firmware and software updates",
      "Performance benchmarking",
      "Replacement of worn components",
      "Detailed maintenance reports",
    ],
  },
];

export default function ServicesPage() {
  return (
    <Section>
      <FadeIn>
        <SectionHeader
          title="Our Services"
          subtitle="Comprehensive technology solutions tailored to your needs."
        />
      </FadeIn>
      <Stagger className="space-y-20">
        {services.map((s, i) => (
          <StaggerItem key={s.slug}>
            <div id={s.slug} className="scroll-mt-24">
              <div
                className={`grid gap-8 md:gap-12 lg:grid-cols-2 ${i % 2 === 1 ? "" : ""}`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mt-4 leading-relaxed text-gray-600">
                    {s.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <svg
                          className="mt-0.5 h-5 w-5 shrink-0 text-brand-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/contact?service=${s.slug}`}
                    className={buttonVariants({ className: "mt-8" })}
                  >
                    Request This Service
                  </Link>
                </div>
                <div
                  className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 p-12 ${i % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  <div className="text-center">
                    <div className="text-6xl font-bold text-brand-200">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-2 text-sm font-medium uppercase tracking-widest text-brand-400">
                      Service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

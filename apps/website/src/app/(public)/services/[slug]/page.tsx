"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Section, FadeIn, buttonVariants } from "@/components/ui";
import { CTA } from "@/components/sections";

const services = [
  {
    slug: "cctv-installation",
    image: "https://images.pexels.com/photos/3205735/pexels-photo-3205735.jpeg",
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
    benefits: [
      "Deter criminal activity with visible surveillance",
      "Monitor your property in real time from anywhere",
      "Reduce insurance premiums with certified security systems",
      "Access recorded footage for investigations and audits",
    ],
  },
  {
    slug: "access-control",
    image: "https://images.pexels.com/photos/37538043/pexels-photo-37538043.jpeg",
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
    benefits: [
      "Prevent unauthorized access to sensitive areas",
      "Track and log all entry activity automatically",
      "Grant or revoke access instantly without changing locks",
      "Integrate with time and attendance tracking",
    ],
  },
  {
    slug: "network-infrastructure",
    image: "https://images.pexels.com/photos/5480781/pexels-photo-5480781.jpeg",
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
    benefits: [
      "Eliminate dead zones with enterprise-grade WiFi",
      "Support more devices without performance loss",
      "Secure your data with proper network segmentation",
      "Scale your infrastructure as your business grows",
    ],
  },
  {
    slug: "workstation-setup",
    image: "https://images.pexels.com/photos/3747094/pexels-photo-3747094.jpeg",
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
    benefits: [
      "Reduce onboarding time for new employees",
      "Ensure consistent configurations across your team",
      "Improve employee comfort and productivity",
      "Minimize downtime during office moves or expansions",
    ],
  },
  {
    slug: "it-support",
    image: "https://images.pexels.com/photos/6754846/pexels-photo-6754846.jpeg",
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
    benefits: [
      "Resolve issues quickly with rapid response times",
      "Prevent problems before they impact your operations",
      "Reduce IT costs with predictable support pricing",
      "Free your team to focus on core business activities",
    ],
  },
  {
    slug: "preventive-maintenance",
    image: "https://images.pexels.com/photos/36861987/pexels-photo-36861987.jpeg",
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
    benefits: [
      "Extend the lifespan of your technology investments",
      "Reduce unexpected breakdowns and emergency costs",
      "Maintain optimal system performance",
      "Plan budgets with predictable maintenance costs",
    ],
  },
];

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === params.slug);

  if (!service) {
    return (
      <Section>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Link href="/services" className="mt-4 inline-block text-brand-700 hover:underline">
            Back to Services
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <Link
              href="/services"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Services
            </Link>

            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {service.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {service.description}
            </p>
          </FadeIn>

          <div className="mt-8">
            <div className="overflow-hidden rounded-xl">
              <Image
                src={service.image}
                alt={service.title}
                width="800"
                height="450"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <FadeIn delay={0.1}>
            <div className="mt-12">
              <h2 className="text-xl font-semibold">Key Features</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.features.map((f) => (
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
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-12">
              <h2 className="text-xl font-semibold">Benefits</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {service.benefits.map((b) => (
                  <li
                    key={b}
                    className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-12 flex gap-4">
              <Link
                href={`/contact?service=${service.slug}`}
                className={buttonVariants({ size: "lg" })}
              >
                Request This Service
              </Link>
              <Link
                href="/contact"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </Section>
      <CTA />
    </>
  );
}

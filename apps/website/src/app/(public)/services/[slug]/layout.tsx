import type { Metadata } from "next";

const services: Record<string, { title: string; description: string }> = {
  "cctv-installation": {
    title: "CCTV Installation",
    description:
      "High-definition surveillance systems for homes, businesses, and institutions. Custom CCTV solutions with remote monitoring and 24/7 recording.",
  },
  "access-control": {
    title: "Access Control Systems",
    description:
      "Biometric, card-based, and smart lock systems. Secure your premises with granular permissions and real-time audit logs.",
  },
  "network-infrastructure": {
    title: "Network Infrastructure",
    description:
      "Structured cabling, enterprise WiFi, and networking for reliable, high-speed connectivity. Networks that scale with your business.",
  },
  "workstation-setup": {
    title: "Workstation Setup",
    description:
      "End-to-end workstation deployment including hardware configuration, software installation, and ergonomic setup.",
  },
  "it-support": {
    title: "IT Support",
    description:
      "On-site and remote IT support with fast response times and proactive system monitoring for your business.",
  },
  "preventive-maintenance": {
    title: "Preventive Maintenance",
    description:
      "Scheduled inspections and maintenance to keep your systems running reliably and extend equipment life.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug];

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.title,
    description: service.description,
    openGraph: {
      title: `${service.title} — Transdel Set-Up Services`,
      description: service.description,
    },
  };
}

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

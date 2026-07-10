import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore our comprehensive range of technology solutions: CCTV installation, access control, network infrastructure, workstation setup, IT support, and preventive maintenance.",
  openGraph: {
    title: "Our Services — Transdel Set-Up Services",
    description:
      "Explore our comprehensive range of technology solutions: CCTV installation, access control, network infrastructure, workstation setup, IT support, and preventive maintenance.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

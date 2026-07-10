import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Transdel Set-Up Services. Request a quotation, ask about our services, or start your project today.",
  openGraph: {
    title: "Contact Transdel Set-Up Services",
    description:
      "Get in touch with Transdel Set-Up Services. Request a quotation, ask about our services, or start your project today.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

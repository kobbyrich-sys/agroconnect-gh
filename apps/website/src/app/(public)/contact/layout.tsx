import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with AgroConnect GH. Reach our team for support, partnership inquiries, or questions about buying and selling on our marketplace.",
  openGraph: {
    title: "Contact AgroConnect GH",
    description:
      "Get in touch with AgroConnect GH. Reach our team for support, partnership inquiries, or questions about buying and selling on our marketplace.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

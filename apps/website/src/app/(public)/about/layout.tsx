import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Transdel Set-Up Services — your trusted partner for security systems and IT infrastructure in Ghana since our founding.",
  openGraph: {
    title: "About Transdel Set-Up Services",
    description:
      "Learn about Transdel Set-Up Services — your trusted partner for security systems and IT infrastructure in Ghana.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about AgroConnect GH — Ghana's digital agricultural marketplace connecting farmers, manufacturers, and buyers directly.",
  openGraph: {
    title: "About AgroConnect GH",
    description:
      "Learn about AgroConnect GH — Ghana's digital agricultural marketplace connecting farmers, manufacturers, and buyers directly.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { Hero } from "@/components/sections/hero";
import { ServicesOverview, AboutPreview, CTA } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <AboutPreview />
      <CTA />
    </>
  );
}

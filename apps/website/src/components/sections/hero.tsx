"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-100" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/20 blur-3xl" />
      </div>

      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Security &amp; IT Infrastructure
            <span className="text-brand-700"> You Can Trust</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600"
        >
          Transdel Set-Up Services delivers enterprise-grade security systems,
          network infrastructure, and IT solutions across Ghana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link href="/contact" className={buttonVariants({ size: "lg" })}>
            Get a Free Quote
          </Link>
          <Link
            href="/services"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Our Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

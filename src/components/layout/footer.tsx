import Link from "next/link";

const services = [
  "CCTV Installation",
  "Access Control",
  "Network Infrastructure",
  "Workstation Setup",
  "IT Support",
  "Preventive Maintenance",
];

export function Footer() {
  return (
    <footer className="bg-brand-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              Transdel<span className="text-accent-400">.</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed">
              Enterprise-grade security systems, IT infrastructure, and
              technology solutions across Ghana.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href={`/services/${s.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["About", "Contact", "Get a Quote"].map((l) => (
                <li key={l}>
                  <Link
                    href={`/${l.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>Accra, Ghana</li>
              <li>
                <a
                  href="tel:+233000000000"
                  className="transition-colors hover:text-white"
                >
                  +233 000 000 000
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@transdel.com"
                  className="transition-colors hover:text-white"
                >
                  info@transdel.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Transdel Set-Up Services. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

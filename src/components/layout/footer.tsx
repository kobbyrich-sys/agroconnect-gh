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
            <img
              src="/logo.png"
              alt="Transdel Set-Up Services"
              className="h-10 w-auto brightness-0 invert"
            />
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
              <li>Tema, Ghana</li>
              <li>
                <a
                  href="tel:+233557410369"
                  className="transition-colors hover:text-white"
                >
                  +233 557 410 369
                </a>
              </li>
              <li>
                <a
                  href="tel:+233538134778"
                  className="transition-colors hover:text-white"
                >
                  +233 538 134 778
                </a>
              </li>
              <li>
                <a
                  href="mailto:transdelsetups@gmail.com"
                  className="transition-colors hover:text-white"
                >
                  transdelsetups@gmail.com
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

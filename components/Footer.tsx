import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={`bg-white border-t border-gray-100 mt-auto ${className || ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image
                src="/images/utveksling.no_Logo.png"
                alt="utveksle.no"
                width={100}
                height={40}
                className="h-auto"
              />
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              Planlegg og utforsk utvekslingsmuligheter ved NTNU. Finn perfekt
              destinasjon basert på ditt studieprogram.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Navigasjon
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/utforsk"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Utforsk
                </Link>
              </li>
              <li>
                <Link
                  href="/fagplan"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Min utveksling
                </Link>
              </li>
              <li>
                <Link
                  href="/erfaringer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Erfaringer
                </Link>
              </li>
              <li>
                <Link
                  href="/fagbank"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Fagbank
                </Link>
              </li>
              <li>
                <Link
                  href="/soknadsprosess"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Søknadsprosess
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/om-oss"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Om oss
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Kontakt
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <a
                  href="mailto:utvekslentnu@gmail.com"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Email
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600">Trondheim</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} utveksle.no Alle rettigheter reservert.
          </p>
          <div className="flex gap-6">
            <Link
              href="/soknadsprosess"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Søknadsprosess
            </Link>
            <Link
              href="/faq"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/om-oss"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Om oss
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

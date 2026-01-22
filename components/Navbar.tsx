"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, ShieldCheck, Menu, X } from "lucide-react";
import Notifications from "./Notifications";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center relative">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/images/utveksle.no_horisontal.png?v=2"
              alt="utveksle.no"
              className="h-6 md:h-7 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu - Centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/utforsk"
              className={`text-sm font-medium transition-colors ${
                isActive("/utforsk")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Utforsk
            </Link>
            <Link
              href="/fagplan"
              className={`text-sm font-medium transition-colors ${
                isActive("/fagplan")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Min utveksling
            </Link>
            <Link
              href="/erfaringer"
              className={`text-sm font-medium transition-colors ${
                isActive("/erfaringer")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Erfaringer
            </Link>
            <Link
              href="/fagbank"
              className={`text-sm font-medium transition-colors ${
                isActive("/fagbank")
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Fagbank
            </Link>
          </div>

          {/* Desktop User Actions - Right aligned */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0 ml-auto">
          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          ) : session ? (
            <>
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <div className="flex items-center">
                <Notifications />
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <User size={16} />
                <span className="hidden sm:inline font-medium">
                  {session.user?.name || session.user?.email}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logg ut</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Logg inn
              </Link>
              <Link
                href="/auth/signin?mode=register"
                className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Registrer
              </Link>
            </div>
          )}
          </div>

          {/* Mobile Notification & Menu Buttons */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            {status === "authenticated" && session && (
              <Notifications />
            )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            <Link
              href="/utforsk"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive("/utforsk")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Utforsk
            </Link>
            <Link
              href="/fagplan"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive("/fagplan")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Min utveksling
            </Link>
            <Link
              href="/erfaringer"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive("/erfaringer")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Erfaringer
            </Link>
            <Link
              href="/fagbank"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive("/fagbank")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Fagbank
            </Link>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-1">
              {status === "loading" ? (
                <div className="px-4 py-3 flex justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
              ) : session ? (
                <>
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <ShieldCheck size={18} />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <User size={18} />
                    {session.user?.name || session.user?.email}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <LogOut size={18} />
                    Logg ut
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Logg inn
                  </Link>
                  <Link
                    href="/auth/signin?mode=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-center text-base font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Registrer
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

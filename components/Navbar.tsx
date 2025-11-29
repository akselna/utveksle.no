"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import Notifications from "./Notifications";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          NTNU Utveksling
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
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

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          ) : session ? (
            <>
              <Notifications />
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User size={16} />
                <span className="hidden sm:inline font-medium">{session.user?.name || session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logg ut</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Logg inn
              </Link>
              <Link
                href="/auth/signin"
                className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Registrer
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-6">
            <li>
              <Link
                href="/utforsk"
                className="text-lg text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Utforsk
              </Link>
            </li>
            <li>
              <Link
                href="/fagplan"
                className="text-lg text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Min utveksling
              </Link>
            </li>
            <li>
              <Link
                href="/erfaringer"
                className="text-lg text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Erfaringer
              </Link>
            </li>
            <li>
              <Link
                href="/fagbank"
                className="text-lg text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Fagbank
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="text-lg text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="text-slate-400">Laster...</div>
          ) : session ? (
            <>
              <div className="flex items-center gap-2 text-slate-700">
                <User size={20} />
                <span className="font-medium">{session.user?.name || session.user?.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-lg text-slate-600 hover:text-red-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogOut size={20} />
                Logg ut
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-lg text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                Logg inn
              </Link>
              <Link
                href="/auth/signin"
                className="text-lg bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Registrer
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

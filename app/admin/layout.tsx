import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Clock,
  Upload
} from "lucide-react";
import { query } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch pending courses count
  let pendingCount = 0;
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM approved_courses WHERE approved = false'
    );
    pendingCount = parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error fetching pending count:', error);
  }

  // Fetch pending learning agreements count
  let pendingLACount = 0;
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM learning_agreements WHERE behandlet = false'
    );
    pendingLACount = parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error fetching pending LA count:', error);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Utveksling App</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-primary-hover hover:text-white rounded-lg transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-primary-hover hover:text-white rounded-lg transition-colors"
          >
            <Users size={20} />
            Users
          </Link>

          <Link
            href="/admin/pending-courses"
            className="flex items-center justify-between gap-3 px-4 py-3 text-gray-300 hover:bg-primary-hover hover:text-white rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock size={20} />
              Ventende kurs
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/learning-agreements"
            className="flex items-center justify-between gap-3 px-4 py-3 text-gray-300 hover:bg-primary-hover hover:text-white rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Upload size={20} />
              Learning Agreements
            </div>
            {pendingLACount > 0 && (
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingLACount}
              </span>
            )}
          </Link>

          <Link
            href="/erfaringer"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-primary-hover hover:text-white rounded-lg transition-colors"
          >
            <FileText size={20} />
            Go to App (Moderate)
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              {session.user.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header (visible on small screens) */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-primary text-white z-40 p-4 flex justify-between items-center">
         <span className="font-bold">Admin Panel</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 md:p-12 pt-20 md:pt-12">
        {children}
      </main>
    </div>
  );
}

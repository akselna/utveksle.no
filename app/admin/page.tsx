import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import {
  Users,
  FileText,
  BookOpen,
  Activity,
  Upload,
} from "lucide-react";
import RecentMappingsTable from "./RecentMappingsTable";
import RecentActivity from "./RecentActivity";

async function getStats() {
  // User stats
  const usersCount = await query(`SELECT COUNT(*) as count FROM users`);
  const newUsersCount = await query(`SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '24 hours'`);

  // Experience stats (Erfaringer)
  const experiencesCount = await query(`SELECT COUNT(*) as count FROM experiences`);
  const newExperiencesCount = await query(`SELECT COUNT(*) as count FROM experiences WHERE created_at > NOW() - INTERVAL '24 hours'`);

  // Course stats (Mappings)
  const mappingsCount = await query(`SELECT COUNT(*) as count FROM course_mappings`);
  const newMappingsCount = await query(`SELECT COUNT(*) as count FROM course_mappings WHERE created_at > NOW() - INTERVAL '14 days'`);

  // Learning Agreements stats
  const learningAgreementsCount = await query(`SELECT COUNT(*) as count FROM learning_agreements`);
  const pendingLearningAgreementsCount = await query(`SELECT COUNT(*) as count FROM learning_agreements WHERE behandlet = false`);

  return {
    users: {
      total: usersCount.rows[0].count,
      new: newUsersCount.rows[0].count
    },
    experiences: {
      total: experiencesCount.rows[0].count,
      new: newExperiencesCount.rows[0].count
    },
    mappings: {
      total: mappingsCount.rows[0].count,
      new: newMappingsCount.rows[0].count // Last 14 days
    },
    learningAgreements: {
      total: learningAgreementsCount.rows[0].count,
      pending: pendingLearningAgreementsCount.rows[0].count
    }
  };
}

async function getRecentMappings() {
  const result = await query(`
    SELECT 
      ac.id, 
      ac.ntnu_course_code as replaced_course_code, 
      ac.ntnu_course_name as replaced_course_name,
      ac.exchange_course_code as foreign_code,
      ac.exchange_course_name as foreign_name,
      ac.exchange_university as university_name,
      ac.created_at,
      ac.verified,
      u.name as user_name,
      u.email as user_email
    FROM approved_courses ac
    LEFT JOIN users u ON ac.user_id = u.id
    WHERE ac.created_at > NOW() - INTERVAL '14 days'
    ORDER BY ac.created_at DESC
    LIMIT 10
  `);
  return result.rows;
}

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/api/auth/signin");
  }

  const stats = await getStats();
  const recentMappings = await getRecentMappings();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {session.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</h3>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-900" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              +{stats.users.new}
            </span>
            <span className="text-gray-500 ml-2">last 24 hours</span>
          </div>
        </div>

        {/* Experiences Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Experiences</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.experiences.total}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              +{stats.experiences.new}
            </span>
            <span className="text-gray-500 ml-2">last 24 hours</span>
          </div>
        </div>

        {/* Mappings Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Course Mappings</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.mappings.total}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              +{stats.mappings.new}
            </span>
            <span className="text-gray-500 ml-2">last 14 days</span>
          </div>
        </div>

        {/* Learning Agreements Card */}
        <a href="/admin/learning-agreements" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer block">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Learning Agreements</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.learningAgreements.total}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Upload className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-orange-600 font-medium flex items-center">
              {stats.learningAgreements.pending} pending
            </span>
            <span className="text-gray-500 ml-2">needs review</span>
          </div>
        </a>
      </div>

      {/* Recent Mappings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            Recent Course Mappings (Last 14 Days)
          </h3>
        </div>
        
        <RecentMappingsTable mappings={recentMappings} />
      </div>

      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}
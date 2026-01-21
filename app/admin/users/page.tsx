import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/users";
import UsersList from "./UsersList";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  if (session.user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const users = await getAllUsers(100); // Fetch up to 100 users

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <span className="bg-gray-100 text-gray-900 text-sm font-medium px-3 py-1 rounded-full">
          Total: {users.length}
        </span>
      </div>

      <UsersList initialUsers={users} />
    </div>
  );
}

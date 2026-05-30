import { db } from "@/lib/db";
import { UserTable } from "./_components/user-table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      _count: {
        select: { products: true },
      },
      products: {
        select: {
          _count: {
            select: {
              entries: true,
              subscribers: {
                where: { confirmedAt: { not: null } },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users total</p>
        </div>
        <a
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← Back to Dashboard
        </a>
      </div>
      <div className="bg-white rounded-lg border shadow-sm">
        <UserTable users={JSON.parse(JSON.stringify(users))} />
      </div>
    </div>
  );
}

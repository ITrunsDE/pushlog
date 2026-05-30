"use client";

import { useState } from "react";

type Product = {
  _count: { entries: number; subscribers: number };
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  _count: { products: number };
  products: Product[];
};

const PLANS = ["free", "solo", "pro"];

export function UserTable({ users: initial }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  const totalEntries = (u: AdminUser) =>
    u.products.reduce((sum, p) => sum + p._count.entries, 0);
  const totalSubscribers = (u: AdminUser) =>
    u.products.reduce((sum, p) => sum + p._count.subscribers, 0);

  async function changePlan(id: string, plan: string) {
    setLoading(id + "-plan");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan } : u)));
    }
    setLoading(null);
  }

  async function deleteUser(id: string, email: string) {
    if (!confirm(`Delete user ${email}? This is irreversible.`)) return;
    setLoading(id + "-delete");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
    setLoading(null);
  }

  async function impersonate(id: string) {
    setLoading(id + "-imp");
    const res = await fetch(`/api/admin/users/${id}/impersonate`, { method: "POST" });
    if (res.ok) {
      window.location.href = "/dashboard";
    }
    setLoading(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 font-semibold border-b">Name</th>
            <th className="px-4 py-2 font-semibold border-b">Email</th>
            <th className="px-4 py-2 font-semibold border-b">Plan</th>
            <th className="px-4 py-2 font-semibold border-b text-center">Products</th>
            <th className="px-4 py-2 font-semibold border-b text-center">Entries</th>
            <th className="px-4 py-2 font-semibold border-b text-center">Subscribers</th>
            <th className="px-4 py-2 font-semibold border-b">Registered</th>
            <th className="px-4 py-2 font-semibold border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{u.name ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-xs">{u.email}</td>
              <td className="px-4 py-2">
                <select
                  value={u.plan}
                  disabled={loading === u.id + "-plan"}
                  onChange={(e) => changePlan(u.id, e.target.value)}
                  className="border rounded px-1 py-0.5 text-xs bg-white"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2 text-center">{u._count.products}</td>
              <td className="px-4 py-2 text-center">{totalEntries(u)}</td>
              <td className="px-4 py-2 text-center">{totalSubscribers(u)}</td>
              <td className="px-4 py-2 text-xs text-gray-500">
                {new Date(u.createdAt).toLocaleDateString("en-GB")}
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => impersonate(u.id)}
                    disabled={!!loading}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading === u.id + "-imp" ? "..." : "Login as"}
                  </button>
                  <button
                    onClick={() => deleteUser(u.id, u.email)}
                    disabled={!!loading}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === u.id + "-delete" ? "..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="text-center text-gray-500 py-8">No users found.</p>
      )}
    </div>
  );
}

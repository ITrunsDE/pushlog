"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/" })}
      className="w-full text-xs text-[#854F0B] hover:text-[#633806] py-2 transition-colors"
    >
      Logout
    </button>
  );
}

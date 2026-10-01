"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      className="nav-item"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
    >
      <LogOut size={17} />
      Sign out
    </button>
  );
}
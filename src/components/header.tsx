"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function Header({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900">
      <span className="text-sm text-zinc-400">
        Hola, <span className="text-white">{userName}</span>
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <LogOut size={16} /> Salir
      </button>
    </header>
  );
}

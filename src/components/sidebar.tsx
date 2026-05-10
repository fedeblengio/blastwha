"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Send,
  FileText,
  LayoutDashboard,
  Settings,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contactos", icon: Users },
  { href: "/dashboard/campaigns", label: "Campañas", icon: Send },
  { href: "/dashboard/templates", label: "Plantillas", icon: FileText },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: QrCode },
  { href: "/dashboard/settings", label: "Config", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-zinc-900 border-r border-zinc-800 p-4 gap-1">
      <h1 className="text-xl font-bold text-green-500 mb-6 px-3">BlastWA</h1>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === href
              ? "bg-green-600/20 text-green-400"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </aside>
  );
}

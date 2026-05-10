"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Send, Clock, CheckCircle, XCircle, FileEdit } from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  _count: { messages: number };
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Send }> = {
  draft: { label: "Borrador", color: "text-zinc-400", icon: FileEdit },
  scheduled: { label: "Programada", color: "text-yellow-400", icon: Clock },
  sending: { label: "Enviando", color: "text-blue-400", icon: Send },
  completed: { label: "Completada", color: "text-green-400", icon: CheckCircle },
  failed: { label: "Fallida", color: "text-red-400", icon: XCircle },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then(setCampaigns);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Campañas</h2>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
        >
          <Plus size={16} /> Nueva campaña
        </Link>
      </div>

      <div className="grid gap-3">
        {campaigns.map((c) => {
          const cfg = statusConfig[c.status] || statusConfig.draft;
          const Icon = cfg.icon;
          return (
            <Link
              key={c.id}
              href={`/dashboard/campaigns/${c.id}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{c.name}</h3>
                <span className={`flex items-center gap-1 text-sm ${cfg.color}`}>
                  <Icon size={14} />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span>{c._count.messages} mensajes</span>
                <span>
                  {new Date(c.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </Link>
          );
        })}
        {campaigns.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            Sin campañas. Crea una para empezar a enviar mensajes.
          </p>
        )}
      </div>
    </div>
  );
}

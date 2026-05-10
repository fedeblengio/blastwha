"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Send, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: number;
  status: string;
  sentAt: string | null;
  error: string | null;
  contact: { phone: string; name: string | null };
};

type Campaign = {
  id: number;
  name: string;
  messageBody: string;
  status: string;
  createdAt: string;
  messages: Message[];
};

const msgStatusIcon: Record<string, { icon: typeof Send; color: string }> = {
  queued: { icon: Clock, color: "text-zinc-400" },
  sending: { icon: Loader2, color: "text-blue-400" },
  sent: { icon: CheckCircle, color: "text-green-400" },
  delivered: { icon: CheckCircle, color: "text-emerald-400" },
  read: { icon: CheckCircle, color: "text-cyan-400" },
  failed: { icon: XCircle, color: "text-red-400" },
};

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then(setCampaign);
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (campaign?.status === "sending") {
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status]);

  const sendCampaign = async () => {
    setSending(true);
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    setSending(false);
    if (res.ok) {
      toast.success("Campaña iniciada");
      load();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  if (!campaign) return <div className="text-zinc-500">Cargando...</div>;

  const sentCount = campaign.messages.filter((m) => m.status === "sent").length;
  const failedCount = campaign.messages.filter(
    (m) => m.status === "failed"
  ).length;
  const totalCount = campaign.messages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{campaign.name}</h2>
          <p className="text-sm text-zinc-500">
            Estado: {campaign.status} | Creada:{" "}
            {new Date(campaign.createdAt).toLocaleDateString("es-AR")}
          </p>
        </div>
        {campaign.status === "draft" && (
          <button
            onClick={sendCampaign}
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Send size={16} /> {sending ? "Iniciando..." : "Enviar ahora"}
          </button>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs text-zinc-500 mb-1">Mensaje:</p>
        <p className="text-sm whitespace-pre-wrap">{campaign.messageBody}</p>
      </div>

      {totalCount > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{sentCount}</p>
              <p className="text-xs text-zinc-500">Enviados</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{failedCount}</p>
              <p className="text-xs text-zinc-500">Fallidos</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                    Contacto
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                    Enviado
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaign.messages.map((msg) => {
                  const cfg = msgStatusIcon[msg.status] || msgStatusIcon.queued;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={msg.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3 text-sm">
                        <span>{msg.contact.phone}</span>
                        {msg.contact.name && (
                          <span className="text-zinc-500 ml-2">
                            ({msg.contact.name})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`flex items-center gap-1 ${cfg.color}`}
                        >
                          <Icon
                            size={14}
                            className={
                              msg.status === "sending" ? "animate-spin" : ""
                            }
                          />
                          {msg.status}
                        </span>
                        {msg.error && (
                          <p className="text-xs text-red-400 mt-1">
                            {msg.error}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {msg.sentAt
                          ? new Date(msg.sentAt).toLocaleString("es-AR")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

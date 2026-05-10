"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ContactList = {
  id: number;
  name: string;
  _count: { contacts: number };
};

type Template = {
  id: number;
  name: string;
  body: string;
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ContactList[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [listId, setListId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/contact-lists").then((r) => r.json()),
      fetch("/api/templates").then((r) => r.json()),
    ]).then(([l, t]) => {
      setLists(l);
      setTemplates(t);
    });
  }, []);

  const create = async () => {
    if (!name || !messageBody || !listId) {
      toast.error("Completa todos los campos");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, messageBody, listId: Number(listId) }),
    });
    setLoading(false);
    if (res.ok) {
      const campaign = await res.json();
      toast.success("Campaña creada");
      router.push(`/dashboard/campaigns/${campaign.id}`);
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Nueva Campaña</h2>

      <div className="space-y-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Nombre de la campaña
          </label>
          <input
            type="text"
            placeholder="Ej: Promo Black Friday"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Lista de contactos
          </label>
          <select
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
          >
            <option value="">Seleccionar lista...</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l._count.contacts} contactos)
              </option>
            ))}
          </select>
        </div>

        {templates.length > 0 && (
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Usar plantilla (opcional)
            </label>
            <select
              onChange={(e) => {
                const t = templates.find(
                  (t) => t.id === Number(e.target.value)
                );
                if (t) setMessageBody(t.body);
              }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
            >
              <option value="">Escribir desde cero...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Mensaje (usa {"{{nombre}}"} y {"{{telefono}}"} como variables)
          </label>
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            rows={6}
            placeholder="Hola {{nombre}}! Te escribimos para..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={create}
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear campaña"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

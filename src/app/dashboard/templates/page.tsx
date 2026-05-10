"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

type Template = {
  id: number;
  name: string;
  body: string;
};

const sampleData = {
  nombre: "Juan Pérez",
  telefono: "+5491155554444",
};

function interpolate(text: string) {
  return text
    .replace(/\{\{nombre\}\}/g, sampleData.nombre)
    .replace(/\{\{telefono\}\}/g, sampleData.telefono);
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates);
  }, []);

  const create = async () => {
    if (!name.trim() || !body.trim()) return;
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    if (res.ok) {
      const t = await res.json();
      setTemplates((prev) => [t, ...prev]);
      setName("");
      setBody("");
      setShowCreate(false);
      toast.success("Plantilla creada");
    }
  };

  const remove = async (id: number) => {
    await fetch("/api/templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Plantilla eliminada");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Plantillas</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
        >
          <Plus size={16} /> Nueva plantilla
        </button>
      </div>

      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Nombre de la plantilla"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
          />
          <textarea
            placeholder="Mensaje. Usa {{nombre}} y {{telefono}} como variables."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 resize-none"
          />
          {body && (
            <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-zinc-500 mb-1">Vista previa:</p>
              <p className="text-sm text-green-400 whitespace-pre-wrap">
                {interpolate(body)}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={create}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{t.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPreview(preview === t.body ? null : t.body)
                  }
                  className="text-zinc-500 hover:text-green-400"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="text-zinc-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-400 whitespace-pre-wrap">
              {t.body}
            </p>
            {preview === t.body && (
              <div className="mt-3 bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                <p className="text-xs text-zinc-500 mb-1">Vista previa:</p>
                <p className="text-sm text-green-400 whitespace-pre-wrap">
                  {interpolate(t.body)}
                </p>
              </div>
            )}
          </div>
        ))}
        {templates.length === 0 && !showCreate && (
          <p className="text-zinc-500 text-sm text-center py-8">
            Sin plantillas. Crea una para reutilizar en tus campañas.
          </p>
        )}
      </div>
    </div>
  );
}

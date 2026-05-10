"use client";

import { useEffect, useState, useRef } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Users,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type ContactList = {
  id: number;
  name: string;
  _count: { contacts: number };
};

type Contact = {
  id: number;
  phone: string;
  name: string | null;
  tags: string[];
  optedOut: boolean;
};

export default function ContactsPage() {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newListName, setNewListName] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/contact-lists")
      .then((r) => r.json())
      .then(setLists);
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetch(`/api/contact-lists/${selectedList}/contacts`)
        .then((r) => r.json())
        .then(setContacts);
    }
  }, [selectedList]);

  const createList = async () => {
    if (!newListName.trim()) return;
    const res = await fetch("/api/contact-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newListName }),
    });
    const list = await res.json();
    setLists((prev) => [{ ...list, _count: { contacts: 0 } }, ...prev]);
    setNewListName("");
    toast.success("Lista creada");
  };

  const addContact = async () => {
    if (!newPhone.trim() || !selectedList) return;
    const res = await fetch(`/api/contact-lists/${selectedList}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone, name: newName || null }),
    });
    if (res.ok) {
      const contact = await res.json();
      setContacts((prev) => [contact, ...prev]);
      setNewPhone("");
      setNewName("");
      setShowAddContact(false);
      toast.success("Contacto agregado");
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const importCSV = async (file: File) => {
    if (!selectedList) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`/api/contact-lists/${selectedList}/import`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(`${data.imported} contactos importados`);
      fetch(`/api/contact-lists/${selectedList}/contacts`)
        .then((r) => r.json())
        .then(setContacts);
    } else {
      toast.error(data.error);
    }
  };

  const deleteContact = async (contactId: number) => {
    if (!selectedList) return;
    await fetch(`/api/contact-lists/${selectedList}/contacts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    toast.success("Contacto eliminado");
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Left panel - Lists */}
      <div className="w-72 flex-shrink-0 space-y-4">
        <h2 className="text-xl font-bold">Listas</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nueva lista..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createList()}
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
          />
          <button
            onClick={createList}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-1">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setSelectedList(list.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedList === list.id
                  ? "bg-green-600/20 text-green-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={16} />
                {list.name}
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                {list._count.contacts}
                <ChevronRight size={14} />
              </span>
            </button>
          ))}
          {lists.length === 0 && (
            <p className="text-zinc-500 text-sm px-3 py-4">
              Crea tu primera lista de contactos
            </p>
          )}
        </div>
      </div>

      {/* Right panel - Contacts */}
      <div className="flex-1 space-y-4">
        {selectedList ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Contactos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                >
                  <Upload size={16} /> Importar CSV
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importCSV(file);
                  }}
                />
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                >
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {showAddContact && (
              <div className="flex gap-2 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
                />
                <input
                  type="text"
                  placeholder="Nombre (opcional)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500"
                />
                <button
                  onClick={addContact}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                >
                  Guardar
                </button>
              </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                      Teléfono
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                      Nombre
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-xs text-zinc-500 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3 text-sm">{contact.phone}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {contact.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400 mr-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-zinc-500 text-sm"
                      >
                        Sin contactos. Agrega uno o importa un CSV.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Selecciona una lista para ver sus contactos
          </div>
        )}
      </div>
    </div>
  );
}

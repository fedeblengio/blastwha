"use client";

import { useEffect, useState } from "react";
import { QrCode, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const checkStatus = async () => {
    const res = await fetch("/api/whatsapp/session");
    const data = await res.json();
    setConnected(data.connected || false);
    setLoading(false);
    return data.connected;
  };

  const startConnection = async () => {
    setConnecting(true);
    await fetch("/api/whatsapp/session", { method: "POST" });

    // Wait a bit for WAHA to generate the QR
    await new Promise((r) => setTimeout(r, 3000));

    const qrRes = await fetch("/api/whatsapp/qr");
    if (qrRes.ok) {
      const data = await qrRes.json();
      setQrCode(data.qr);
    } else {
      toast.error("No se pudo generar el QR. Intenta de nuevo.");
    }
    setConnecting(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Poll for connection status when QR is showing
  useEffect(() => {
    if (!qrCode) return;
    const interval = setInterval(async () => {
      const isConnected = await checkStatus();
      if (isConnected) {
        setQrCode(null);
        toast.success("WhatsApp conectado!");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [qrCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        Verificando conexión...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-xl font-bold">WhatsApp</h2>

      {connected ? (
        <div className="bg-zinc-900 border border-green-800 rounded-xl p-8 text-center space-y-4">
          <CheckCircle size={48} className="text-green-500 mx-auto" />
          <h3 className="text-lg font-medium text-green-400">
            WhatsApp Conectado
          </h3>
          <p className="text-sm text-zinc-400">
            Tu cuenta de WhatsApp está vinculada y lista para enviar campañas.
          </p>
          <button
            onClick={checkStatus}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
          >
            <RefreshCw size={14} /> Verificar estado
          </button>
        </div>
      ) : qrCode ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
          <h3 className="text-lg font-medium">Escanea el código QR</h3>
          <p className="text-sm text-zinc-400">
            Abre WhatsApp en tu celular, ve a Dispositivos vinculados y escanea
            este código.
          </p>
          <div className="bg-white rounded-xl p-4 inline-block">
            <img
              src={qrCode}
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>
          <p className="text-xs text-zinc-500">
            <Loader2 size={12} className="inline animate-spin mr-1" />
            Esperando conexión...
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-4">
          <QrCode size={48} className="text-zinc-600 mx-auto" />
          <h3 className="text-lg font-medium">Conecta tu WhatsApp</h3>
          <p className="text-sm text-zinc-400">
            Vincula tu cuenta de WhatsApp para poder enviar campañas masivas.
          </p>
          <button
            onClick={startConnection}
            disabled={connecting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {connecting ? (
              <>
                <Loader2 size={14} className="inline animate-spin mr-2" />
                Generando QR...
              </>
            ) : (
              "Conectar WhatsApp"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

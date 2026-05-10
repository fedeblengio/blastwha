import Link from "next/link";
import { Send, Users, BarChart3, Upload, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-green-500">BlastWA</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-lg font-medium"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-block px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full mb-6">
          Campañas de WhatsApp para tu negocio
        </div>
        <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Enviá mensajes masivos por{" "}
          <span className="text-green-500">WhatsApp</span>
          <br />
          simple y barato
        </h2>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Importa tus contactos, crea campañas con plantillas personalizadas, y
          enviá miles de mensajes con un click. Sin complicaciones.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium text-lg transition-colors"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-12">
          Todo lo que necesitás
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Upload,
              title: "Importa contactos",
              desc: "Sube un CSV o agrega contactos manualmente. Organiza en listas con tags.",
            },
            {
              icon: Send,
              title: "Campañas masivas",
              desc: "Crea mensajes con variables personalizadas. Programa envíos o enviá al instante.",
            },
            {
              icon: BarChart3,
              title: "Seguí el progreso",
              desc: "Monitorea en tiempo real: enviados, entregados, leídos y fallidos.",
            },
            {
              icon: Zap,
              title: "Plantillas reutilizables",
              desc: "Crea plantillas con {{nombre}} y {{telefono}} para personalizar cada mensaje.",
            },
            {
              icon: Shield,
              title: "Anti-ban integrado",
              desc: "Rate limiting inteligente de 1 mensaje cada 3 segundos para proteger tu cuenta.",
            },
            {
              icon: Users,
              title: "Tu propio WhatsApp",
              desc: "Conecta tu cuenta personal o de negocio. Los mensajes salen desde tu número.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <Icon size={24} className="text-green-500 mb-4" />
              <h4 className="font-semibold mb-2">{title}</h4>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-12">
          Precios simples
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              features: [
                "100 mensajes/mes",
                "1 lista de contactos",
                "Plantillas básicas",
              ],
              cta: "Empezar gratis",
              highlight: false,
            },
            {
              name: "Starter",
              price: "$9",
              features: [
                "2.000 mensajes/mes",
                "Listas ilimitadas",
                "Importar CSV",
                "Plantillas con variables",
              ],
              cta: "Elegir Starter",
              highlight: true,
            },
            {
              name: "Pro",
              price: "$29",
              features: [
                "10.000 mensajes/mes",
                "Todo de Starter",
                "Campañas programadas",
                "Soporte prioritario",
              ],
              cta: "Elegir Pro",
              highlight: false,
            },
          ].map(({ name, price, features, cta, highlight }) => (
            <div
              key={name}
              className={`rounded-xl p-6 border ${
                highlight
                  ? "bg-green-600/10 border-green-600/50"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <h4 className="font-semibold mb-1">{name}</h4>
              <p className="text-3xl font-bold mb-4">
                {price}
                <span className="text-sm text-zinc-500 font-normal">
                  /mes
                </span>
              </p>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="text-sm text-zinc-400 flex gap-2">
                    <span className="text-green-500">-</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`block text-center px-4 py-2 rounded-lg text-sm font-medium ${
                  highlight
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
        <p>
          BlastWA by{" "}
          <span className="text-zinc-400 font-medium">Ubrabyte</span> - {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

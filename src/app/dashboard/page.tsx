import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Send, Users, CheckCircle, XCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = Number(session!.user.id);

  const [contactCount, campaignCount, sentCount, failedCount] =
    await Promise.all([
      prisma.contact.count({ where: { list: { userId } } }),
      prisma.campaign.count({ where: { userId } }),
      prisma.campaignMessage.count({
        where: { campaign: { userId }, status: "sent" },
      }),
      prisma.campaignMessage.count({
        where: { campaign: { userId }, status: "failed" },
      }),
    ]);

  const stats = [
    {
      label: "Contactos",
      value: contactCount,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Campañas",
      value: campaignCount,
      icon: Send,
      color: "text-green-400",
    },
    {
      label: "Enviados",
      value: sentCount,
      icon: CheckCircle,
      color: "text-emerald-400",
    },
    {
      label: "Fallidos",
      value: failedCount,
      icon: XCircle,
      color: "text-red-400",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

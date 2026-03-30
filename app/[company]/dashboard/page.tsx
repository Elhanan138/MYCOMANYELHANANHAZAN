import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatRelativeTime, getStatusBgColor } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import type { DashboardStats, Company } from "@/types";
import {
  Bot,
  CircleDot,
  Activity,
  DollarSign,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getDashboard(companyId: string): Promise<DashboardStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies/${companyId}/dashboard`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ company: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const { company: slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  const stats = await getDashboard(company.id);

  const kpis = [
    {
      label: "סוכנים פעילים",
      value: stats ? `${stats.activeAgents}/${stats.totalAgents}` : "—",
      icon: Bot,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      label: "נושאים פתוחים",
      value: stats?.openIssues ?? "—",
      icon: CircleDot,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "ריצות פעילות",
      value: stats?.runningRuns ?? "—",
      icon: Play,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "אישורים ממתינים",
      value: stats?.pendingApprovals ?? "—",
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "סה״כ עלויות",
      value: stats ? formatCurrency(stats.totalCostUsd) : "—",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ededed]">לוח בקרה</h1>
        <p className="text-sm text-[#a3a3a3] mt-1">{company.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-[#121212] border border-[#262626] rounded-xl p-4"
            >
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-[#ededed]">{kpi.value}</div>
              <div className="text-xs text-[#a3a3a3] mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by status */}
        <div className="bg-[#121212] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">נושאים לפי סטטוס</h2>
          {stats && stats.issuesByStatus.length > 0 ? (
            <div className="space-y-2">
              {stats.issuesByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBgColor(item.status)}`}
                  >
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                  <span className="text-sm font-medium text-[#ededed]">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#525252] text-center py-6">אין נושאים עדיין</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-[#121212] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">פעילות אחרונה</h2>
          {stats && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#ededed] truncate">{item.action}</p>
                    <p className="text-xs text-[#525252]">
                      {formatRelativeTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#525252] text-center py-6">אין פעילות עדיין</p>
          )}
          <Link
            href={`/${slug}/activity`}
            className="block text-center text-xs text-indigo-400 hover:text-indigo-300 mt-4"
          >
            צפה בכל הפעילות
          </Link>
        </div>
      </div>

      {/* Cost chart - simple representation */}
      {stats && stats.costByDay.length > 0 && (
        <div className="bg-[#121212] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">עלויות (7 ימים אחרונים)</h2>
          <div className="flex items-end gap-2 h-20">
            {stats.costByDay.map((day, i) => {
              const max = Math.max(...stats.costByDay.map((d) => d.cost), 0.001);
              const height = Math.max((day.cost / max) * 100, 4);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-indigo-600/60 hover:bg-indigo-600 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${formatCurrency(day.cost)}`}
                  />
                  <span className="text-[10px] text-[#525252]">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

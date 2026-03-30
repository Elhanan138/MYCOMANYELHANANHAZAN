import { notFound } from "next/navigation";
import { formatDateTime, getStatusBgColor } from "@/lib/utils";
import type { ActivityLog, Company } from "@/types";
import { Activity, Bot, User, Cpu } from "lucide-react";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getActivity(companyId: string): Promise<ActivityLog[]> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${companyId}/activity`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

interface Props { params: Promise<{ company: string }> }

const ACTOR_ICONS: Record<string, React.ElementType> = {
  agent: Bot,
  board: User,
  system: Cpu,
};

const ACTOR_LABELS: Record<string, string> = {
  agent: "סוכן",
  board: "לוח",
  system: "מערכת",
};

export default async function ActivityPage({ params }: Props) {
  const { company: slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();
  const activity = await getActivity(company.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-indigo-400" />
        <div>
          <h1 className="text-2xl font-bold text-[#ededed]">פעילות</h1>
          <p className="text-sm text-[#a3a3a3]">יומן פעולות מלא — {company.name}</p>
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Activity className="h-12 w-12 text-[#333] mb-4" />
          <p className="text-[#525252] text-sm">אין פעילות עדיין</p>
          <p className="text-[#3a3a3a] text-xs mt-1">
            פעולות יופיעו כאן ברגע שהמערכת תתחיל לפעול
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#262626] rounded-xl divide-y divide-[#1e1e1e]">
          {activity.map((entry) => {
            const Icon = ACTOR_ICONS[entry.actorType] || Cpu;
            return (
              <div key={entry.id} className="flex items-start gap-4 p-4">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#a3a3a3]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusBgColor(entry.actorType)}`}>
                      {ACTOR_LABELS[entry.actorType] || entry.actorType}
                    </span>
                    {entry.actor && (
                      <span className="text-sm font-medium text-[#ededed]">{entry.actor.name}</span>
                    )}
                    {entry.entityType && (
                      <span className="text-xs text-[#525252]">• {entry.entityType}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#c0c0c0] mt-1">{entry.action}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-[#525252] whitespace-nowrap">
                  {formatDateTime(entry.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Target, Plus } from "lucide-react";
import { getStatusBgColor } from "@/lib/utils";
import { STATUS_LABELS, GOAL_LEVEL_LABELS } from "@/lib/constants";
import type { Goal, Company } from "@/types";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getGoals(companyId: string): Promise<Goal[]> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${companyId}/goals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

interface Props { params: Promise<{ company: string }> }

export default async function GoalsPage({ params }: Props) {
  const { company: slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();
  const goals = await getGoals(company.id);

  const rootGoals = goals.filter((g) => !g.parentGoalId);
  const subGoals = goals.filter((g) => g.parentGoalId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-[#ededed]">מטרות</h1>
            <p className="text-sm text-[#a3a3a3]">יעדים ארגוניים ואישיים</p>
          </div>
        </div>
        <Link
          href={`/${slug}/goals/new`}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg"
        >
          <Plus className="h-4 w-4" />
          מטרה חדשה
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Target className="h-12 w-12 text-[#333] mb-4" />
          <p className="text-[#525252] text-sm">אין מטרות עדיין</p>
          <p className="text-[#3a3a3a] text-xs mt-1">צור מטרה ראשונה כדי להתחיל</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rootGoals.map((goal) => {
            const children = subGoals.filter((s) => s.parentGoalId === goal.id);
            return (
              <div key={goal.id} className="bg-[#111] border border-[#262626] rounded-xl overflow-hidden">
                <Link
                  href={`/${slug}/goals/${goal.id}`}
                  className="flex items-center justify-between p-4 hover:bg-[#141414] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#ededed] group-hover:text-white">
                        {goal.name}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-[#525252] line-clamp-1 mt-0.5">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#525252]">
                      {GOAL_LEVEL_LABELS[goal.level] || goal.level}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBgColor(goal.status)}`}>
                      {STATUS_LABELS[goal.status] || goal.status}
                    </span>
                    {children.length > 0 && (
                      <span className="text-xs text-[#525252]">{children.length} תת-מטרות</span>
                    )}
                  </div>
                </Link>
                {children.length > 0 && (
                  <div className="border-t border-[#1e1e1e] divide-y divide-[#1a1a1a]">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/${slug}/goals/${child.id}`}
                        className="flex items-center justify-between px-4 py-3 pr-12 hover:bg-[#0e0e0e] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#525252]" />
                          <span className="text-sm text-[#a3a3a3]">{child.name}</span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusBgColor(child.status)}`}>
                          {STATUS_LABELS[child.status] || child.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

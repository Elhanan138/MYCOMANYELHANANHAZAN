import { notFound } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { STATUS_LABELS, APPROVAL_TYPE_LABELS } from "@/lib/constants";
import { AlertCircle, CircleDot, Play, Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Company } from "@/types";

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

async function getInbox(companyId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/agents/me/inbox-lite?companyId=${companyId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { approvals: [], issues: [], runs: [] };
    return res.json();
  } catch {
    return { approvals: [], issues: [], runs: [] };
  }
}

interface Props {
  params: Promise<{ company: string }>;
}

export default async function InboxPage({ params }: Props) {
  const { company: slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  const inbox = await getInbox(company.id);
  const totalItems =
    inbox.approvals.length + inbox.issues.length + inbox.runs.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#ededed]">תיבת דואר</h1>
        <p className="text-sm text-[#a3a3a3] mt-1">
          פריטים הדורשים תשומת לב
        </p>
      </div>

      {totalItems === 0 ? (
        <EmptyState
          icon={Inbox}
          title="תיבת דואר ריקה"
          description="אין פריטים הדורשים תשומת לב כרגע"
        />
      ) : (
        <div className="space-y-4">
          {/* Pending approvals */}
          {inbox.approvals.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                אישורים ממתינים ({inbox.approvals.length})
              </h2>
              <div className="space-y-2">
                {inbox.approvals.map((approval: any) => (
                  <Link
                    key={approval.id}
                    href={`/${slug}/approvals`}
                    className="flex items-center justify-between p-3 bg-[#121212] border border-[#262626] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-[#ededed]">
                        {APPROVAL_TYPE_LABELS[approval.type] || approval.type}
                      </span>
                    </div>
                    <span className="text-xs text-[#525252]">
                      {formatRelativeTime(approval.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Blocked issues */}
          {inbox.issues.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 flex items-center gap-2">
                <CircleDot className="h-4 w-4 text-orange-400" />
                נושאים חסומים ({inbox.issues.length})
              </h2>
              <div className="space-y-2">
                {inbox.issues.map((issue: any) => (
                  <Link
                    key={issue.id}
                    href={`/${slug}/issues/${issue.id}`}
                    className="flex items-center justify-between p-3 bg-[#121212] border border-[#262626] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#525252] font-mono">
                        {issue.identifier}
                      </span>
                      <span className="text-sm text-[#ededed]">{issue.title}</span>
                    </div>
                    <span className="text-xs text-[#525252]">
                      {formatRelativeTime(issue.updatedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Failed runs */}
          {inbox.runs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-[#a3a3a3] mb-2 flex items-center gap-2">
                <Play className="h-4 w-4 text-red-400" />
                ריצות שנכשלו ({inbox.runs.length})
              </h2>
              <div className="space-y-2">
                {inbox.runs.map((run: any) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 bg-[#121212] border border-[#262626] rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-[#ededed] font-mono">
                        {run.id.slice(0, 8)}...
                      </span>
                      {run.errorMessage && (
                        <span className="text-xs text-red-400 truncate max-w-xs">
                          {run.errorMessage}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#525252]">
                      {formatRelativeTime(run.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

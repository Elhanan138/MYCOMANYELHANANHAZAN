"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Agent } from "@/types";

interface OrgNode {
  agent: Agent;
  children: OrgNode[];
}

function buildTree(agents: Agent[]): OrgNode[] {
  const map: Record<string, OrgNode> = {};
  agents.forEach((a) => { map[a.id] = { agent: a, children: [] }; });
  const roots: OrgNode[] = [];
  agents.forEach((a) => {
    if (a.reportsToId && map[a.reportsToId]) {
      map[a.reportsToId].children.push(map[a.id]);
    } else {
      roots.push(map[a.id]);
    }
  });
  return roots;
}

const STATUS_COLORS: Record<string, string> = {
  active: "border-green-500/50 bg-green-500/5",
  inactive: "border-neutral-600 bg-neutral-800/30",
  archived: "border-neutral-700 bg-neutral-900/30",
};

function AgentNode({ node, companySlug, depth = 0 }: { node: OrgNode; companySlug: string; depth?: number }) {
  const { agent, children } = node;
  const colorClass = STATUS_COLORS[agent.status] || STATUS_COLORS.inactive;

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/${companySlug}/agents/${agent.id}`}
        className={`relative flex flex-col items-center p-4 rounded-xl border ${colorClass} w-44 hover:bg-[#1e1e1e] transition-colors group`}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mb-2"
          style={{ backgroundColor: `hsl(${agent.name.charCodeAt(0) * 17 % 360}, 60%, 40%)` }}
        >
          {agent.name.charAt(0)}
        </div>
        <div className="text-sm font-medium text-[#ededed] text-center leading-tight">{agent.name}</div>
        {agent.title && (
          <div className="text-xs text-[#a3a3a3] text-center mt-0.5 leading-tight">{agent.title}</div>
        )}
        <div className="text-xs text-[#525252] mt-1">{agent.adapterType || "cli"}</div>
        <div
          className={`absolute top-2 left-2 w-2 h-2 rounded-full ${
            agent.status === "active" ? "bg-green-400" : "bg-neutral-600"
          }`}
        />
      </Link>

      {children.length > 0 && (
        <>
          <div className="w-px h-6 bg-[#333]" />
          <div className="flex gap-8 relative">
            {children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-[#333]"
                style={{
                  right: `${50 / children.length}%`,
                  left: `${50 / children.length}%`,
                }}
              />
            )}
            {children.map((child) => (
              <div key={child.agent.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-[#333]" />
                <AgentNode node={child} companySlug={companySlug} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgPage() {
  const { company } = useParams<{ company: string }>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then((c) => fetch(`/api/agents?companyId=${c.id}`))
      .then((r) => r.json())
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company]);

  const tree = buildTree(agents);

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-[#ededed]">מבנה ארגוני</h1>
            <p className="text-sm text-[#a3a3a3]">היררכיית הסוכנים בחברה</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="p-2 rounded-lg border border-[#262626] hover:bg-[#1e1e1e] text-[#a3a3a3]"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm text-[#a3a3a3] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="p-2 rounded-lg border border-[#262626] hover:bg-[#1e1e1e] text-[#a3a3a3]"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg border border-[#262626] hover:bg-[#1e1e1e] text-[#a3a3a3]"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0d0d0d] border border-[#262626] rounded-xl overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Network className="h-12 w-12 text-[#333] mb-4" />
            <p className="text-[#525252] text-sm">אין סוכנים עדיין</p>
            <p className="text-[#3a3a3a] text-xs mt-1">
              הוסף סוכנים כדי לראות את המבנה הארגוני
            </p>
          </div>
        ) : (
          <div
            className="flex justify-center p-12 min-w-max"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            <div className="flex gap-16">
              {tree.map((node) => (
                <AgentNode key={node.agent.id} node={node} companySlug={company} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

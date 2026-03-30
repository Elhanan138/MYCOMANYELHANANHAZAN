import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Company } from "@/types";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface CompanyLayoutProps {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}

export default async function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { company: slug } = await params;
  const [company, companies] = await Promise.all([
    getCompany(slug),
    getCompanies(),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar company={company} companies={companies} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

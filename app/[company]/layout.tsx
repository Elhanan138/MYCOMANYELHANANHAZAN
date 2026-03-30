import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Company } from "@/types";
import { db, initDb } from "@/db";
import { companies } from "@/db/schema";
import { eq, or, isNull } from "drizzle-orm";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    await initDb();
    const [company] = await db
      .select()
      .from(companies)
      .where(or(eq(companies.id, slug), eq(companies.slug, slug)));
    return (company as Company) || null;
  } catch {
    return null;
  }
}

async function getCompanies(): Promise<Company[]> {
  try {
    await initDb();
    return db
      .select()
      .from(companies)
      .where(isNull(companies.archivedAt))
      .orderBy(companies.createdAt) as Promise<Company[]>;
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

import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { db, initDb } from "@/db";
import { companies } from "@/db/schema";
import { isNull } from "drizzle-orm";

async function getFirstCompany() {
  try {
    await initDb();
    const result = await db
      .select()
      .from(companies)
      .where(isNull(companies.archivedAt))
      .orderBy(companies.createdAt)
      .limit(1);
    return result[0] || null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const company = await getFirstCompany();
  if (company) redirect(`/${company.slug}/dashboard`);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-[#ededed]">Paperclip</h1>
          <p className="text-[#525252] mt-1 text-sm">פלטפורמת תיאום סוכני AI</p>
        </div>

        {/* Form */}
        <OnboardingForm />
      </div>
    </div>
  );
}

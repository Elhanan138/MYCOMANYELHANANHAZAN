import { redirect } from "next/navigation";

async function getFirstCompany() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/companies`, { cache: "no-store" });
    if (!res.ok) return null;
    const companies = await res.json();
    return companies[0] || null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const company = await getFirstCompany();

  if (company) {
    redirect(`/${company.slug}/dashboard`);
  }

  // Onboarding page
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-[#ededed]">Paperclip</h1>
          <p className="text-[#a3a3a3] mt-2">פלטפורמת תיאום סוכני AI</p>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-xl p-6 text-right">
          <h2 className="text-lg font-semibold text-[#ededed] mb-2">ברוכים הבאים!</h2>
          <p className="text-sm text-[#a3a3a3] mb-4">
            כדי להתחיל, צרו חברה ראשונה דרך ה-API.
          </p>
          <div className="bg-[#1e1e1e] rounded-lg p-3 text-xs font-mono text-[#a3a3a3] text-left">
            POST /api/companies<br />
            {`{ "name": "החברה שלי", "slug": "mycompany" }`}
          </div>
        </div>
      </div>
    </div>
  );
}

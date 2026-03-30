import { OnboardingForm } from "@/components/OnboardingForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewCompanyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-[#ededed]">חברה חדשה</h1>
          <p className="text-[#525252] mt-1 text-sm">הוסף workspace חדש ל-Paperclip</p>
        </div>
        <OnboardingForm />
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#525252] hover:text-[#a3a3a3] transition-colors">
            <ArrowRight className="h-3.5 w-3.5" />
            חזור ללוח הבקרה
          </Link>
        </div>
      </div>
    </div>
  );
}

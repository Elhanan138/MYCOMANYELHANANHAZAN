import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Paperclip - פלטפורמת תיאום סוכנים",
  description: "פלטפורמת ניהול וסיזור סוכני AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="h-full bg-[#0a0a0a] text-[#ededed] antialiased">
        {children}
        <Toaster
          position="bottom-left"
          theme="dark"
          richColors
          dir="rtl"
        />
      </body>
    </html>
  );
}

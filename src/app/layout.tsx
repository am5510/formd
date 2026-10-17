import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ProgressProvider } from "@/context/ProgressContext";

export const metadata: Metadata = {
  title: "ระบบประเมินโครงการฝึกอบรม | Training Evaluation System",
  description:
    "ระบบประเมินผลโครงการฝึกอบรมและแดชบอร์ดสรุปผลสถิติสำหรับหน่วยงานภาครัฐและองค์กร เชื่อมต่อ Neon Database และ Cloudflare R2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        <ProgressProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
        </ProgressProvider>
      </body>
    </html>
  );
}

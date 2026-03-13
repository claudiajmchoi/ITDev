import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "아이디어 사업화 분석 서비스",
  description: "멀티 LLM 앙상블 AI가 아이디어의 사업화 성공 가능성을 분석합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

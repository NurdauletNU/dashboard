import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orders Dashboard",
  description: "RetailCRM + Supabase orders dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <nav style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>📦 Orders Dashboard</span>
          <a href="/"         style={{ color: "var(--muted)" }}>Главная</a>
          <a href="/dashboard" style={{ color: "var(--muted)" }}>Dashboard</a>
        </nav>
        <main style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

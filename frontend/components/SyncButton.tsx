"use client";

import { useState } from "react";
import { triggerSync } from "@/lib/api";

export default function SyncButton({ onDone }: { onDone?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await triggerSync();
      setResult(`✓ Синхронизировано: ${data.synced}, уведомлений: ${data.notified}`);
      onDone?.();
    } catch (e: any) {
      setResult(`✗ Ошибка: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          background:    loading ? "var(--muted)" : "var(--accent)",
          color:         "#fff",
          border:        "none",
          borderRadius:  6,
          padding:       "8px 18px",
          cursor:        loading ? "default" : "pointer",
          fontWeight:    600,
          fontSize:      14,
        }}
      >
        {loading ? "Синхронизация..." : "↻ Синхронизировать"}
      </button>
      {result && (
        <span style={{
          fontSize: 13,
          color: result.startsWith("✓") ? "var(--green)" : "var(--red)",
        }}>
          {result}
        </span>
      )}
    </div>
  );
}

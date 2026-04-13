"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchStats, fetchOrders } from "@/lib/api";
import StatCard    from "@/components/StatCard";
import OrdersChart from "@/components/OrdersChart";
import OrdersTable from "@/components/OrdersTable";
import SyncButton  from "@/components/SyncButton";

export default function DashboardPage() {
  const [stats,   setStats]   = useState<any>(null);
  const [orders,  setOrders]  = useState<any>(null);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState("");
  const [city,    setCity]    = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, o] = await Promise.all([
        fetchStats(),
        fetchOrders({ page, limit: 20, status, city }),
      ]);
      setStats(s);
      setOrders(o);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, status, city]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <SyncButton onDone={loadData} />
      </div>

      {error && (
        <div style={{
          background: "#fee2e2", color: "#b91c1c",
          border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px",
        }}>
          {error} — убедитесь, что бэкенд запущен на localhost:8000
        </div>
      )}

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <StatCard label="Всего заказов"  value={stats.total_orders} />
          <StatCard label="Выручка"        value={`${stats.total_revenue.toLocaleString("ru-RU")} ₸`} />
          <StatCard label="Средний чек"    value={`${stats.avg_order.toLocaleString("ru-RU")} ₸`} />
          <StatCard
            label="Новых"
            value={stats.by_status?.new ?? 0}
            sub={`из ${stats.total_orders}`}
          />
        </div>
      )}

      {/* Charts */}
      {stats && (
        <OrdersChart byDay={stats.by_day} byCity={stats.by_city} />
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          placeholder="Фильтр по городу"
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1); }}
          style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, width: 200 }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6 }}
        >
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="complete">complete</option>
          <option value="assembling">assembling</option>
          <option value="cancel">cancel</option>
        </select>
        {(city || status) && (
          <button
            onClick={() => { setCity(""); setStatus(""); setPage(1); }}
            style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Table */}
      {loading && <p style={{ color: "var(--muted)" }}>Загрузка...</p>}
      {orders && !loading && (
        <OrdersTable
          orders={orders.data}
          total={orders.total}
          page={page}
          limit={20}
          onPage={setPage}
        />
      )}
    </div>
  );
}

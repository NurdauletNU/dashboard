const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchStats() {
  const res = await fetch(`${BASE}/api/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  city?: string;
}) {
  const q = new URLSearchParams();
  if (params.page)   q.set("page",   String(params.page));
  if (params.limit)  q.set("limit",  String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.city)   q.set("city",   params.city);
  const res = await fetch(`${BASE}/api/orders?${q}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function triggerSync() {
  const res = await fetch(`${BASE}/api/sync/run`, { method: "POST" });
  if (!res.ok) throw new Error("Sync failed");
  return res.json();
}

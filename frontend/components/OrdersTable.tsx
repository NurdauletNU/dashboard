"use client";

interface Order {
  id:          number;
  total_price: number;
  created_at:  string;
  city:        string;
  status:      string;
}

interface Props {
  orders: Order[];
  total:  number;
  page:   number;
  limit:  number;
  onPage: (p: number) => void;
}

const STATUS_COLOR: Record<string, string> = {
  new:        "#3b82f6",
  complete:   "#10b981",
  cancel:     "#ef4444",
  assembling: "#f59e0b",
};

export default function OrdersTable({ orders, total, page, limit, onPage }: Props) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--bg)" }}>
            {["ID", "Сумма", "Город", "Статус", "Дата"].map((h) => (
              <th key={h} style={{
                padding: "10px 16px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: 12,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: "1px solid var(--border)",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={o.id} style={{
              borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <td style={{ padding: "10px 16px", fontFamily: "monospace" }}>#{o.id}</td>
              <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                {o.total_price.toLocaleString("ru-RU")} ₸
              </td>
              <td style={{ padding: "10px 16px" }}>{o.city || "—"}</td>
              <td style={{ padding: "10px 16px" }}>
                <span style={{
                  background: (STATUS_COLOR[o.status] ?? "#718096") + "22",
                  color:       STATUS_COLOR[o.status] ?? "#718096",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {o.status}
                </span>
              </td>
              <td style={{ padding: "10px 16px", color: "var(--muted)" }}>
                {o.created_at ? new Date(o.created_at).toLocaleDateString("ru-RU") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        color: "var(--muted)",
        fontSize: 13,
      }}>
        <span>Всего: {total}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            style={{ padding: "4px 12px", cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Назад
          </button>
          <span>{page} / {totalPages}</span>
          <button
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            style={{ padding: "4px 12px", cursor: page >= totalPages ? "default" : "pointer", opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}

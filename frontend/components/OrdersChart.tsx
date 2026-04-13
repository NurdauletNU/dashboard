"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
);

interface Props {
  byDay:  Record<string, number>;
  byCity: Record<string, number>;
}

export default function OrdersChart({ byDay, byCity }: Props) {
  const dayLabels  = Object.keys(byDay);
  const dayValues  = Object.values(byDay);
  const cityLabels = Object.keys(byCity);
  const cityValues = Object.values(byCity);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Line: orders by day */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 20,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 16 }}>Заказы по дням</p>
        <Line
          data={{
            labels: dayLabels,
            datasets: [{
              label: "Заказы",
              data:  dayValues,
              borderColor:     "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.08)",
              borderWidth: 2,
              pointRadius: 3,
              fill: true,
              tension: 0.3,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { maxTicksLimit: 10 } },
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }}
        />
      </div>

      {/* Bar: top cities */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 20,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 16 }}>Топ городов</p>
        <Bar
          data={{
            labels: cityLabels,
            datasets: [{
              label: "Заказов",
              data:  cityValues,
              backgroundColor: "#3b82f6",
              borderRadius: 4,
            }],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } },
            },
          }}
        />
      </div>
    </div>
  );
}

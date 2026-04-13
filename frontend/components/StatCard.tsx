interface Props {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: Props) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "20px 24px",
    }}>
      <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700 }}>{value}</p>
      {sub && <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

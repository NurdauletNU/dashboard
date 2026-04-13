from fastapi import APIRouter
from services.supabase_client import get_supabase

router = APIRouter()


@router.get("")
def get_stats():
    sb = get_supabase()

    all_rows = sb.table("orders").select("total_price, status, created_at, city").execute()
    rows     = all_rows.data or []

    total_revenue  = sum(r["total_price"] for r in rows)
    total_orders   = len(rows)
    avg_order      = round(total_revenue / total_orders, 2) if total_orders else 0

    by_status: dict[str, int] = {}
    for r in rows:
        s = r.get("status") or "unknown"
        by_status[s] = by_status.get(s, 0) + 1

    # orders by day
    by_day: dict[str, int] = {}
    for r in rows:
        day = (r.get("created_at") or "")[:10]
        if day:
            by_day[day] = by_day.get(day, 0) + 1

    by_city: dict[str, int] = {}
    for r in rows:
        city = r.get("city") or "—"
        by_city[city] = by_city.get(city, 0) + 1

    return {
        "total_orders":   total_orders,
        "total_revenue":  round(total_revenue, 2),
        "avg_order":      avg_order,
        "by_status":      by_status,
        "by_day":         dict(sorted(by_day.items())),
        "by_city":        dict(sorted(by_city.items(), key=lambda x: -x[1])[:10]),
    }

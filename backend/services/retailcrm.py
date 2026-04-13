import requests as req
from config import settings


def _session() -> req.Session:
    s = req.Session()
    s.headers.update({"Accept": "application/json"})
    return s


def calc_total(order: dict) -> float:
    total = 0.0
    for item in order.get("items") or []:
        qty   = item.get("quantity") or 0
        price = item.get("initialPrice") or item.get("price") or 0
        total += qty * price
    return round(total or order.get("sumTotal") or 0.0, 2)


def fetch_orders_page(page: int, since_id: int = 0) -> dict:
    response = _session().get(
        f"{settings.retailcrm_url}/api/v5/orders",
        params={
            "apiKey":          settings.retailcrm_api_key,
            "limit":           100,
            "page":            page,
            "filter[sinceId]": since_id or "",
        },
        timeout=20,
    )
    response.raise_for_status()
    data = response.json()
    if not data.get("success"):
        raise RuntimeError(data.get("errors") or data.get("errorMsg"))
    return data


def fetch_all_orders(since_id: int = 0) -> list[dict]:
    all_orders: list[dict] = []
    page = 1
    while True:
        data   = fetch_orders_page(page, since_id)
        orders = data.get("orders") or []
        if not orders:
            break
        all_orders.extend(orders)
        pagination  = data.get("pagination", {})
        total_pages = pagination.get("totalPageCount", 1)
        if page >= total_pages:
            break
        page += 1
    return all_orders


def transform_order(order: dict) -> dict | None:
    crm_id = order.get("id")
    if crm_id is None:
        return None
    delivery = order.get("delivery") or {}
    address  = delivery.get("address") or {}
    city = address.get("city") or address.get("text") or ""
    return {
        "id":          int(crm_id),
        "total_price": calc_total(order),
        "created_at":  order.get("createdAt"),
        "city":        city,
        "status":      order.get("status") or "unknown",
    }

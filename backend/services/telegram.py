import httpx
from config import settings

SEND_URL = f"https://api.telegram.org/bot{settings.telegram_token}/sendMessage"


async def send_notification(order: dict, total: float) -> bool:
    order_id = order.get("id", "—")
    client   = f"{order.get('firstName', '')} {order.get('lastName', '')}".strip() or "—"
    text = (
        f"🛒 *Новый заказ: {total:,.0f} ₸*\n"
        f"ID: `{order_id}`\n"
        f"Клиент: {client}\n"
        f"Статус: {order.get('status', '—')}"
    )
    async with httpx.AsyncClient() as client_http:
        r = await client_http.post(
            SEND_URL,
            json={
                "chat_id":    settings.telegram_chat_id,
                "text":       text,
                "parse_mode": "Markdown",
            },
            timeout=10,
        )
        return r.status_code == 200

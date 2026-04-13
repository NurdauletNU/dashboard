"""
Standalone polling notifier.
Run: python notifier.py
Or via cron: * * * * * python /path/to/notifier.py
"""
import logging
import time
from datetime import datetime
from pathlib import Path

import requests
import httpx
from dotenv import load_dotenv

load_dotenv()

from config import settings

LOG_DIR       = "logs"
STATE_FILE    = "last_seen_id.txt"
SENT_IDS_FILE = "sent_ids.txt"


def setup_logging() -> logging.Logger:
    Path(LOG_DIR).mkdir(exist_ok=True)
    stamp  = datetime.now().strftime("%Y%m%d_%H%M%S")
    logger = logging.getLogger("notifier")
    logger.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s  %(levelname)-7s  %(message)s", "%Y-%m-%d %H:%M:%S")
    for handler in [
        logging.FileHandler(f"{LOG_DIR}/notifier_{stamp}.log", encoding="utf-8"),
        logging.FileHandler(f"{LOG_DIR}/notifier_errors_{stamp}.log", encoding="utf-8"),
        logging.StreamHandler(),
    ]:
        handler.setFormatter(fmt)
    logger.addHandler(logging.FileHandler(f"{LOG_DIR}/notifier_{stamp}.log", encoding="utf-8"))
    logger.addHandler(logging.StreamHandler())
    return logger


def load_last_seen_id() -> int:
    try:
        return int(Path(STATE_FILE).read_text().strip())
    except (FileNotFoundError, ValueError):
        return 0


def save_last_seen_id(oid: int) -> None:
    Path(STATE_FILE).write_text(str(oid))


def load_sent_ids() -> set[int]:
    try:
        lines = Path(SENT_IDS_FILE).read_text().splitlines()
        return {int(l.strip()) for l in lines if l.strip().isdigit()}
    except FileNotFoundError:
        return set()


def mark_sent(oid: int) -> None:
    with open(SENT_IDS_FILE, "a") as f:
        f.write(f"{oid}\n")


def calc_total(order: dict) -> float:
    total = 0.0
    for item in order.get("items") or []:
        total += (item.get("quantity") or 0) * (item.get("initialPrice") or 0)
    return round(total or order.get("sumTotal") or 0.0, 2)


def fetch_new_orders(since_id: int) -> list[dict]:
    r = requests.get(
        f"{settings.retailcrm_url}/api/v5/orders",
        params={"apiKey": settings.retailcrm_api_key, "limit": 100,
                "page": 1, "filter[sinceId]": since_id or ""},
        timeout=15,
    )
    r.raise_for_status()
    data = r.json()
    if not data.get("success"):
        raise RuntimeError(data.get("errors"))
    return [o for o in (data.get("orders") or []) if (o.get("id") or 0) > since_id]


def send_tg(order: dict, total: float) -> bool:
    oid    = order.get("id", "—")
    client = f"{order.get('firstName', '')} {order.get('lastName', '')}".strip() or "—"
    text   = f"🛒 *Новый заказ: {total:,.0f} ₸*\nID: `{oid}`\nКлиент: {client}\nСтатус: {order.get('status', '—')}"
    r = httpx.post(
        f"https://api.telegram.org/bot{settings.telegram_token}/sendMessage",
        json={"chat_id": settings.telegram_chat_id, "text": text, "parse_mode": "Markdown"},
        timeout=10,
    )
    return r.status_code == 200


def check_once(logger: logging.Logger) -> None:
    since_id = load_last_seen_id()
    sent_ids = load_sent_ids()
    try:
        orders = fetch_new_orders(since_id)
    except Exception as e:
        logger.error("FETCH  %s", e)
        return

    if not orders:
        logger.info("POLL   no new orders (since_id=%d)", since_id)
        return

    max_id = since_id
    for order in orders:
        oid   = order.get("id") or 0
        total = calc_total(order)
        if total > settings.order_min_sum:
            if oid in sent_ids:
                logger.warning("DEDUP  order_id=%s already sent", oid)
            else:
                ok = send_tg(order, total)
                if ok:
                    mark_sent(oid)
                    sent_ids.add(oid)
                    logger.info("SENT   order_id=%s  total=%.0f₸", oid, total)
        if oid > max_id:
            max_id = oid

    save_last_seen_id(max_id)


def main():
    logger = setup_logging()
    logger.info("START  poll_interval=%ds  min_sum=%.0f₸", settings.poll_interval, settings.order_min_sum)
    while True:
        try:
            check_once(logger)
        except Exception as e:
            logger.error("LOOP  %s", e)
        time.sleep(settings.poll_interval)


if __name__ == "__main__":
    main()

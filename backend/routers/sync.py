import logging
from fastapi import APIRouter, BackgroundTasks
from services.supabase_client import get_supabase
from services.retailcrm import fetch_all_orders, transform_order
from services.telegram import send_notification
from config import settings

router = APIRouter()
logger = logging.getLogger("sync")


def _load_last_seen_id() -> int:
    try:
        sb     = get_supabase()
        result = sb.table("orders").select("id").order("id", desc=True).limit(1).execute()
        if result.data:
            return result.data[0]["id"]
    except Exception:
        pass
    return 0


async def _do_sync() -> dict:
    since_id = _load_last_seen_id()
    logger.info("SYNC start since_id=%d", since_id)

    raw_orders = fetch_all_orders(since_id=since_id)
    rows       = [r for o in raw_orders if (r := transform_order(o)) is not None]

    saved = 0
    notified = 0

    if rows:
        sb = get_supabase()
        for i in range(0, len(rows), 500):
            sb.table("orders").upsert(rows[i:i + 500], on_conflict="id").execute()
            saved += len(rows[i:i + 500])

    for order in raw_orders:
        from services.retailcrm import calc_total
        total = calc_total(order)
        if total > settings.order_min_sum:
            ok = await send_notification(order, total)
            if ok:
                notified += 1

    logger.info("SYNC done saved=%d notified=%d", saved, notified)
    return {"synced": saved, "notified": notified, "since_id": since_id}


@router.post("")
async def trigger_sync(background_tasks: BackgroundTasks):
    background_tasks.add_task(_do_sync)
    return {"status": "sync started"}


@router.post("/run")
async def run_sync_now():
    result = await _do_sync()
    return result

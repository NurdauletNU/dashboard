from fastapi import APIRouter, HTTPException, Query
from services.supabase_client import get_supabase

router = APIRouter()


@router.get("")
def list_orders(
    page:   int = Query(1, ge=1),
    limit:  int = Query(50, ge=1, le=200),
    status: str = Query(""),
    city:   str = Query(""),
):
    sb     = get_supabase()
    offset = (page - 1) * limit

    query = sb.table("orders").select("*", count="exact")
    if status:
        query = query.eq("status", status)
    if city:
        query = query.ilike("city", f"%{city}%")

    result = (
        query
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {
        "data":  result.data,
        "total": result.count,
        "page":  page,
        "limit": limit,
    }


@router.get("/{order_id}")
def get_order(order_id: int):
    sb     = get_supabase()
    result = sb.table("orders").select("*").eq("id", order_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return result.data

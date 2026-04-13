import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const res    = await fetch(`${BACKEND}/api/orders?${search}`, { cache: "no-store" });
  const data   = await res.json();
  return NextResponse.json(data, { status: res.status });
}

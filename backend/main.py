from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import orders, sync, stats

app = FastAPI(title="Orders Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(sync.router,   prefix="/api/sync",   tags=["sync"])
app.include_router(stats.router,  prefix="/api/stats",  tags=["stats"])


@app.get("/api/health")
def health():
    return {"status": "ok"}

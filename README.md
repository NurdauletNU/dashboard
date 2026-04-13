# orders-dashboard

RetailCRM → Supabase → Next.js dashboard + Telegram notifications.

## Структура

```
orders-dashboard/
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── config.py                # pydantic-settings
│   ├── notifier.py              # polling notifier (standalone)
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── orders.py            # GET /api/orders
│   │   ├── sync.py              # POST /api/sync/run
│   │   └── stats.py             # GET /api/stats
│   └── services/
│       ├── supabase_client.py
│       ├── retailcrm.py
│       └── telegram.py
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # redirect → /dashboard
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx         # main dashboard page
│   │   └── api/orders/
│   │       └── route.ts         # Next.js API proxy
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── OrdersChart.tsx      # Line + Bar charts
│   │   ├── OrdersTable.tsx      # paginated table
│   │   └── SyncButton.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── .env.example
└── scripts/
    └── migration.sql            # Supabase table
```

## Быстрый старт

### 1. Supabase — создать таблицу
```sql
-- scripts/migration.sql → Supabase SQL Editor
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # заполнить переменные
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local    # заполнить переменные
npm install
npm run dev
# → http://localhost:3000
```

### 4. Notifier (опционально, для Telegram)
```bash
cd backend
python notifier.py
```

## API

| Method | Path            | Описание                          |
|--------|-----------------|-----------------------------------|
| GET    | /api/health     | Проверка сервера                  |
| GET    | /api/orders     | Список заказов (page, limit, фильтры) |
| GET    | /api/orders/:id | Один заказ                        |
| GET    | /api/stats      | Статистика, by_day, by_city       |
| POST   | /api/sync/run   | Синхронизация + Telegram уведомления |

## Переменные окружения

### Backend `.env`
| Переменная          | Описание                            |
|---------------------|-------------------------------------|
| RETAILCRM_API_KEY   | API ключ RetailCRM                  |
| RETAILCRM_URL       | https://your-domain.retailcrm.ru    |
| SUPABASE_URL        | URL проекта Supabase                |
| SUPABASE_KEY        | service_role key                    |
| TELEGRAM_TOKEN      | Токен бота от @BotFather            |
| TELEGRAM_CHAT_ID    | ID чата или @username               |
| ORDER_MIN_SUM       | Порог суммы для уведомления (default: 50000) |
| POLL_INTERVAL       | Интервал опроса в секундах (default: 60) |

### Frontend `.env.local`
| Переменная                    | Описание              |
|-------------------------------|-----------------------|
| NEXT_PUBLIC_SUPABASE_URL      | URL проекта Supabase  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | anon key              |
| NEXT_PUBLIC_API_URL           | http://localhost:8000 |

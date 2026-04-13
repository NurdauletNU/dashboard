from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    retailcrm_api_key: str
    retailcrm_url: str

    supabase_url: str
    supabase_key: str

    telegram_token: str
    telegram_chat_id: str

    order_min_sum: float = 50_000
    poll_interval: int = 60

    class Config:
        env_file = ".env"


settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    """App Settings for Hibinka51"""

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/hibinka_db"

    # --- JWT & Auth ---
    SECRET_KEY: str = "temporary_secret_key_for_development_only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Project Info ---
    DEBUG: bool = True
    PROJECT_NAME: str = "Hibinka API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Email (Yandex) ---
    EMAIL_HOST: str = "smtp.yandex.ru"
    EMAIL_PORT: int = 465
    EMAIL_USE_SSL: bool = True
    EMAIL_HOST_USER: str = ""
    EMAIL_HOST_PASSWORD: str = ""
    DEFAULT_FROM_EMAIL: str = ""

    ADMIN_EMAIL: str = ""

    # Настройки Pydantic v2: объединяем env_file и правила обработки
    model_config = SettingsConfigDict(
        env_file=".env.dev",
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """Превращаем строку CORS_ORIGINS в список для FastAPI"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()

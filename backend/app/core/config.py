from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """App Settings"""

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ACCESS_TOKEN_EXPIRE_DAYS: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application
    DEBUG: bool = True
    PROJECT_NAME: str = "Hibinka API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Email
    EMAIL_HOST: str = "smtp.mail.ru"
    EMAIL_PORT: int = 465
    EMAIL_USE_SSL: bool = True
    EMAIL_HOST_USER: str = ""
    EMAIL_HOST_PASSWORD: str = ""
    DEFAULT_FROM_EMAIL: str = "noreply@hibinka51.ru"

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        """List of allowed CORS origins"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

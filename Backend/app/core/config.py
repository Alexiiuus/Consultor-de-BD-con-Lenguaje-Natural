from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "Backend API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: str = "http://localhost:8000,http://localhost:3000"
    MISTRAL_API_KEY: str
    MISTRAL_MODEL: str = "mistral-large-latest"

    @property
    def cors_origins(self) -> list[str]:
        return [x.strip() for x in self.BACKEND_CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()

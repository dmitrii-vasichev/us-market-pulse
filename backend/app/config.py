from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://localhost:5432/market_pulse"
    fred_api_key: str = ""
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def asyncpg_url(self) -> str:
        """Convert postgresql:// URL to asyncpg-compatible format."""
        url = self.database_url
        if url.startswith("postgresql://"):
            return url
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

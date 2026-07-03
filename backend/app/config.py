from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    secret_key: str = "change-me"
    allowed_origins: str = "http://localhost:3000"

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # LLM — "groq" ou "gemini" (ambos via API compatível com OpenAI)
    llm_provider: str = "groq"
    llm_api_key: str
    llm_model: str = ""

    # Mana economy
    mana_cost_per_story: int = 10
    mana_welcome_bonus: int = 100

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def llm_base_url(self) -> str:
        urls = {
            "groq": "https://api.groq.com/openai/v1",
            "gemini": "https://generativelanguage.googleapis.com/v1beta/openai/",
        }
        if self.llm_provider not in urls:
            raise ValueError(
                f"LLM_PROVIDER inválido: {self.llm_provider!r} (use 'groq' ou 'gemini')"
            )
        return urls[self.llm_provider]

    @property
    def resolved_llm_model(self) -> str:
        if self.llm_model:
            return self.llm_model
        defaults = {
            "groq": "llama-3.3-70b-versatile",
            "gemini": "gemini-2.5-flash",
        }
        return defaults[self.llm_provider]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

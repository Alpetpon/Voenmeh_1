from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # Telegram Bot
    BOT_TOKEN: str
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    
    # ProverkaCheka.com API
    PROVERKACHEKA_TOKEN: str = ""
    
    # Yandex OAuth2 Configuration
    YANDEX_CLIENT_ID: str
    YANDEX_CLIENT_SECRET: str
    
    # Admin Configuration  
    ADMIN_USERNAME: str = "chief_accountant"
    ADMIN_CHAT_ID: Optional[int] = None
    
    # Application Settings
    DEBUG: bool = False
    
    # OAuth Server Settings
    OAUTH_HOST: str = "localhost"
    OAUTH_PORT: int = 8080
    OAUTH_REDIRECT_URI: str = "http://localhost:8080/oauth/callback"
    
    # Legacy Yandex Disk settings (для обратной совместимости)
    yandex_disk_token: Optional[str] = Field(None, alias='YANDEX_DISK_TOKEN')
    yandex_disk_api_url: str = Field(
        default="https://cloud-api.yandex.net/v1/disk", 
        alias='YANDEX_DISK_API_URL'
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 
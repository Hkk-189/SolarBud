from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/solarwatch"
    swpc_plasma_url: str = "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json"
    swpc_mag_url: str = "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json"
    swpc_kp_url: str = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
    alerts_dry_run: bool = True
    model_dir: str = "artefacts"


settings = Settings()

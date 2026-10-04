"""initial schema: solar_wind_1m, kp_3h, forecast

Revision ID: 0001
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None


def upgrade() -> None:
    ts = sa.DateTime(timezone=True)
    op.create_table(
        "solar_wind_1m",
        sa.Column("time", ts, primary_key=True),
        sa.Column("source", sa.String(32)),
        *[sa.Column(c, sa.Float) for c in (
            "density_cm3", "speed_kms", "bx_gsm_nt", "by_gsm_nt", "bz_gsm_nt", "bt_nt")],
    )
    op.create_table(
        "kp_3h",
        sa.Column("time", ts, primary_key=True),
        sa.Column("kp", sa.Float),
        sa.Column("source", sa.String(16), nullable=False),
    )
    op.create_table(
        "forecast",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("issued_at", ts, nullable=False),
        sa.Column("model_version", sa.String(64), nullable=False),
        sa.Column("data_stale", sa.Boolean, nullable=False),
        sa.Column("horizons", postgresql.JSONB, nullable=False),
    )
    op.create_index("ix_forecast_issued_at", "forecast", ["issued_at"])


def downgrade() -> None:
    op.drop_table("forecast")
    op.drop_table("kp_3h")
    op.drop_table("solar_wind_1m")

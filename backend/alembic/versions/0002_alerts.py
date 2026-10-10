"""alert_state (single row) and alert_event

Revision ID: 0002
"""

import sqlalchemy as sa

from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade() -> None:
    ts = sa.DateTime(timezone=True)
    op.create_table(
        "alert_state",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("level", sa.String(16), nullable=False),
        sa.Column("up", sa.Integer, nullable=False),
        sa.Column("down", sa.Integer, nullable=False),
        sa.Column("cooldown", sa.Integer, nullable=False),
        sa.Column("since", ts),
    )
    op.create_table(
        "alert_event",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("issued_at", ts, nullable=False),
        sa.Column("level", sa.String(16), nullable=False),
        sa.Column("p_exceed", sa.Float, nullable=False),
        sa.Column("observed_kp", sa.Float),
    )
    op.create_index("ix_alert_event_issued_at", "alert_event", ["issued_at"])


def downgrade() -> None:
    op.drop_table("alert_event")
    op.drop_table("alert_state")

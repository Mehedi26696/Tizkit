"""add_monetization_to_marketplace

Revision ID: 3066eb31cfa8
Revises: a7f4553b6e60
Create Date: 2026-01-11 20:01:59.144414

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3066eb31cfa8'
down_revision: Union[str, Sequence[str], None] = 'a7f4553b6e60'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add columns as nullable first
    op.add_column('marketplace_items', sa.Column('is_free', sa.Boolean(), nullable=True))
    op.add_column('marketplace_items', sa.Column('price', sa.Float(), nullable=True))
    
    # Fill existing rows with defaults
    op.execute("UPDATE marketplace_items SET is_free = TRUE, price = 0.0")
    
    # Set NOT NULL constraint
    op.alter_column('marketplace_items', 'is_free', nullable=False)
    op.alter_column('marketplace_items', 'price', nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('marketplace_items', 'price')
    op.drop_column('marketplace_items', 'is_free')

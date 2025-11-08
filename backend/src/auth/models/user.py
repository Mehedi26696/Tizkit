from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, Boolean
import sqlalchemy.dialects.postgresql as pg
import uuid


class User(SQLModel, table=True):
    """Database model for a user using UUID primary key."""
    __tablename__ = "users"
    id:  uuid.UUID = Field(
        sa_column = Column(
            pg.UUID,
            nullable = False,
            primary_key = True,
            default = uuid.uuid4
        )
    )
    email: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            unique=True,
            nullable=False
        ),
    )
    username: str = Field(
        sa_column=Column(
            pg.VARCHAR(100),
            index=True,
            nullable=False
        ),
    )
    full_name: Optional[str] = Field(
        sa_column=Column(
            pg.VARCHAR(100),
            nullable=True
        ),
    )
    password_hash: str = Field(
        sa_column=Column(
            pg.VARCHAR(255),
            nullable=False
        ),
    )
    is_active: bool = Field(
        default=True,
        sa_column=Column(Boolean, nullable=False)
    )
    created_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )
    updated_at:  datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now
        )
    )

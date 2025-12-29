"""create projects and files tables

Revision ID: c1a2b3c4d5e6
Revises: a74b0e949c7f
Create Date: 2025-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c1a2b3c4d5e6'
down_revision: Union[str, None] = 'a74b0e949c7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('latex_content', sa.Text(), nullable=True),
        sa.Column('compiled_pdf_url', sa.String(), nullable=True),
        sa.Column('preview_image_url', sa.String(), nullable=True),
        sa.Column('is_template', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('tags', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_user_id'), 'projects', ['user_id'], unique=False)
    op.create_index(op.f('ix_projects_status'), 'projects', ['status'], unique=False)
    op.create_index(op.f('ix_projects_created_at'), 'projects', ['created_at'], unique=False)

    # Create project_files table
    op.create_table(
        'project_files',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False, server_default='text'),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('file_url', sa.String(), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_files_project_id'), 'project_files', ['project_id'], unique=False)
    op.create_index(op.f('ix_project_files_file_type'), 'project_files', ['file_type'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_project_files_file_type'), table_name='project_files')
    op.drop_index(op.f('ix_project_files_project_id'), table_name='project_files')
    op.drop_table('project_files')
    
    op.drop_index(op.f('ix_projects_created_at'), table_name='projects')
    op.drop_index(op.f('ix_projects_status'), table_name='projects')
    op.drop_index(op.f('ix_projects_user_id'), table_name='projects')
    op.drop_table('projects')

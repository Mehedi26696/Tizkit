"""create sub_projects and file_links tables

Revision ID: d2b3c4d5e6f7
Revises: c1a2b3c4d5e6
Create Date: 2025-12-29 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd2b3c4d5e6f7'
down_revision: Union[str, None] = 'c1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create sub_projects table
    op.create_table(
        'sub_projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, server_default='Untitled'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sub_project_type', sa.String(length=50), nullable=False),
        sa.Column('latex_code', sa.Text(), nullable=True),
        sa.Column('editor_data', sa.Text(), nullable=True),
        sa.Column('source_file_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('preview_image_url', sa.String(), nullable=True),
        sa.Column('compiled_pdf_url', sa.String(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['source_file_id'], ['project_files.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sub_projects_project_id'), 'sub_projects', ['project_id'], unique=False)
    op.create_index(op.f('ix_sub_projects_user_id'), 'sub_projects', ['user_id'], unique=False)
    op.create_index(op.f('ix_sub_projects_sub_project_type'), 'sub_projects', ['sub_project_type'], unique=False)

    # Create sub_project_file_links table (many-to-many between sub_projects and project_files)
    op.create_table(
        'sub_project_file_links',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sub_project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('project_file_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('usage_type', sa.String(length=50), nullable=False, server_default='reference'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['sub_project_id'], ['sub_projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_file_id'], ['project_files.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sub_project_file_links_sub_project_id'), 'sub_project_file_links', ['sub_project_id'], unique=False)
    op.create_index(op.f('ix_sub_project_file_links_project_file_id'), 'sub_project_file_links', ['project_file_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_sub_project_file_links_project_file_id'), table_name='sub_project_file_links')
    op.drop_index(op.f('ix_sub_project_file_links_sub_project_id'), table_name='sub_project_file_links')
    op.drop_table('sub_project_file_links')
    
    op.drop_index(op.f('ix_sub_projects_sub_project_type'), table_name='sub_projects')
    op.drop_index(op.f('ix_sub_projects_user_id'), table_name='sub_projects')
    op.drop_index(op.f('ix_sub_projects_project_id'), table_name='sub_projects')
    op.drop_table('sub_projects')

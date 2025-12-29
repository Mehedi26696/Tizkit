
from typing import Optional
from sqlmodel import select
from src.utils.database import get_session
from src.auth.models.user import User
from passlib.context import CryptContext

# Use bcrypt_sha256 as the primary scheme to avoid bcrypt's 72-byte input limit.
# Keep plain bcrypt in the schemes list so existing hashes (if any) can still be verified.
pwd_context = CryptContext(schemes=["argon2", "bcrypt_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = session.exec(statement).first()
    return result


def create_user(session, *, email: str, username: str, password: str, full_name: Optional[str] = None) -> User:
    hashed = hash_password(password)
    user = User(email=email, username=username, password_hash=hashed, full_name=full_name)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session, email: str, password: str) -> Optional[User]:
    """Authenticate by email OR username for OAuth2PasswordRequestForm compatibility.

    The OAuth2 form exposes a `username` field which clients often use to send
    either the user's email or their username. Historically this project used
    email as the identifier; to be forgiving, try to find the user by email
    first and fall back to username lookup.
    """
    user = get_user_by_email(session, email)
    # if not found by email, try username lookup (allow login using username)
    if not user:
        statement = select(User).where(User.username == email)
        user = session.exec(statement).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_user(session, user: User, *, full_name: Optional[str] = None, username: Optional[str] = None) -> User:
    """Update user profile fields."""
    if full_name is not None:
        user.full_name = full_name
    if username is not None:
        user.username = username
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def change_password(session, user: User, new_password: str) -> User:
    """Change user's password."""
    user.password_hash = hash_password(new_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user



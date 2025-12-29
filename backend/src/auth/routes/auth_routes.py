from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta
from sqlmodel import Session, select
from src.utils.database import get_session
from src.auth.schemas.user_schemas import UserCreate, User, Token, UserUpdate, PasswordChange
from src.auth.services.user_service import create_user, authenticate_user, get_user_by_email, update_user, change_password, verify_password
from src.auth.services.auth_service import create_access_token, decode_access_token
from src.config import settings

auth_router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@auth_router.post("/register", response_model=User)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    existing = get_user_by_email(session, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(session, email=user_in.email, username=user_in.username, password=user_in.password, full_name=user_in.full_name)
    return user


@auth_router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    from uuid import UUID as UUIDType
    from src.auth.models.user import User as UserModel

    try:
        stmt = select(UserModel).where(UserModel.id == UUIDType(user_id))
        found = session.exec(stmt).first()
        if not found:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return found
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


@auth_router.get("/me", response_model=User)
def read_me(current_user = Depends(get_current_user)):
    return current_user


@auth_router.put("/me", response_model=User)
def update_me(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user's profile."""
    # Check if username is being changed and if it's already taken
    if user_update.username and user_update.username != current_user.username:
        existing = session.exec(
            select(current_user.__class__).where(current_user.__class__.username == user_update.username)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    updated_user = update_user(
        session, 
        current_user, 
        full_name=user_update.full_name,
        username=user_update.username
    )
    return updated_user


@auth_router.post("/me/change-password")
def change_my_password(
    password_data: PasswordChange,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Change current user's password."""
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Validate new password
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    change_password(session, current_user, password_data.new_password)
    return {"message": "Password changed successfully"}
 
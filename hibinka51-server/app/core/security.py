from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncio
from concurrent.futures import ThreadPoolExecutor

from pydantic import deprecated

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
executor = ThreadPoolExecutor(max_workers=4)


async def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password
    Args:
        plain_password (str): plain password
        hashed_password (str): hashed password
    Returns:
        bool: True if password is correct, False otherwise
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        executor, pwd_context.verify, plain_password, hashed_password
    )


async def get_password_hash(password: str) -> str:
    """
    Password Hashing
    Args:
        password (str): plain password
    Returns:
        str: hashed password
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, pwd_context.hash, password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str):
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None

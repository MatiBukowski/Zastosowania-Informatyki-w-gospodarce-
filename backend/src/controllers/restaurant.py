from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import Restaurant

router = APIRouter()

@router.get("/restaurants")
def get_restaurants(session: Session = Depends(get_session)):
    restaurants = session.execute(select(Restaurant)).scalars().all()
    return restaurants

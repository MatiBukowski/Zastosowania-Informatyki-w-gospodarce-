import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models import Restaurant, MenuItem
from src.services import seed_restaurants, seed_menu_items
from src.db import Base

engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestSeedService:

    def test_seed_restaurants(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()

        assert session.query(Restaurant).count() == 0

        seed_restaurants(session, count=25)
        assert session.query(Restaurant).count() == 25

        seed_restaurants(session, count=30)
        assert session.query(Restaurant).count() == 30

        session.close()
        Base.metadata.drop_all(bind=engine)

    def test_seed_menu_items(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()

        assert session.query(MenuItem).count() == 0

        seed_menu_items(session, count=10, number_of_restaurants=5)
        assert session.query(MenuItem).count() == 50

        seed_menu_items(session, count=20, number_of_restaurants=5)
        assert session.query(MenuItem).count() == 100

        session.close()
        Base.metadata.drop_all(bind=engine)

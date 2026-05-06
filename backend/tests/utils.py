from src.models import (
    CuisineTypeEnum,
    Restaurant,
    MenuItem,
    AppUser,
    RestaurantTable,
    RestaurantUser
)
from src.security import PasswordHandler

def create_restaurants(db):
    restaurant = Restaurant(
        name="Test Restaurant",
        address="Test Address",
        has_kiosk=True,
        cuisine=CuisineTypeEnum.ITALIAN,
        photo="test.jpg",
        description="restaurant description"
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant

def create_menu(db):
    menu = [
        MenuItem(
            restaurant_id=1,
            name="Test dish 1",
            description="Test description 1",
            price=31.99,
            is_available=True
        ),
        MenuItem(
            restaurant_id=2,
            name="Test dish 2",
            description="Test description 2",
            price=171.99,
            is_available=True
        )
    ]
    db.add_all(menu)
    db.commit()

def create_tables(db, restaurant_id: int = 1):
    table = RestaurantTable(
        restaurant_id=restaurant_id,
        table_number=1,
        capacity=4,
        status="FREE"
    )
    db.add(table)
    db.commit()

def create_user(db):
    user = AppUser(
        email="test@example.com",
        password_hash=PasswordHandler.hash_password("password123"),
        first_name="John",
        surname="Doe"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def assign_user_to_restaurant(db, user_id, restaurant_id):
    restaurant_user = RestaurantUser(user_id=user_id, restaurant_id=restaurant_id)
    db.add(restaurant_user)
    db.commit()

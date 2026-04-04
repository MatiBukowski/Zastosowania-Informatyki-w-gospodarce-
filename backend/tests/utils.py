from src.models import CuisineTypeEnum, Restaurant, MenuItem


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

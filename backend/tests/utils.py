from src.models import CuisineTypeEnum, Restaurant


def create_restaurants(db):
    restaurant = Restaurant(
        name="Test Restaurant",
        address="Test Address",
        has_kiosk=True,
        cuisine=CuisineTypeEnum.ITALIAN,
        photo="test.jpg"
    )
    db.add(restaurant)
    db.commit()

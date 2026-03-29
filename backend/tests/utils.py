from backend.src.models import Restaurant


def create_restaurants(db):
    restaurant = Restaurant(
        name="Test Restaurant",
        address="Test Address",
        has_kiosk=True,
        cuisine="ITALIAN",
        photo="test.jpg",
        description="restaurant description"
    )
    db.add(restaurant)
    db.commit()

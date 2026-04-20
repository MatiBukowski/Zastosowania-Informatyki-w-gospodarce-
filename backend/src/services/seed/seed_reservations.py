import random
from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session
from ...models import RestaurantTable, Reservation, AppUser
from ...models.enums import ReservationStatusEnum

def seed_reservations(session: Session, max_sample_tables: int = 15):
    tables = session.query(RestaurantTable).all()
    if not tables:
        raise ValueError("No tables in database! Run seed_tables first.")

    users = session.query(AppUser).all()
    if not users:
        raise ValueError("No users in database! Run seed_users first.")

    target_total = min(len(tables), max_sample_tables)
    existing_count = session.query(Reservation).count()
    to_add_count = target_total - existing_count

    if to_add_count <= 0:
        print(f"Database already contains {existing_count} reservations. Skipping.")
        return

    sample_tables = random.sample(tables, min(len(tables), max_sample_tables)) 
    reservations_to_add = []

    for _ in range(to_add_count):
        random_table = random.choice(sample_tables)
        random_user = random.choice(users)
        
        random_date = datetime.now(UTC) + timedelta(
            days=random.randint(1, 14), 
            hours=random.randint(8, 22),
            minutes=random.choice([0, 30])
        )
        
        new_reservation = Reservation(
            user_id=random_user.user_id,
            restaurant_id=random_table.restaurant_id,
            table_id=random_table.table_id,
            reservation_time=random_date,
            status=random.choice(list(ReservationStatusEnum))
        )
        reservations_to_add.append(new_reservation)

    session.add_all(reservations_to_add)
    session.commit()
    print(f"Successfully seeded {len(reservations_to_add)} reservations!")

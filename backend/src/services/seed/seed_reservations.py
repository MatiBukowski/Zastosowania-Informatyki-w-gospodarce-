import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ...models import RestaurantTable, Reservation, AppUser
from ...models.enums import ReservationStatusEnum

def seed_reservations(session: Session, reservations_per_table: int = 1):
    tables = session.query(RestaurantTable).all()
    if not tables:
        raise ValueError("No tables in database! Run seed_tables first.")

    users = session.query(AppUser).all()
    if not users:
        raise ValueError("No users in database! Run seed_users first.")
    
    existing_count = session.query(Reservation).count()
    if existing_count > 0:
        print(f"Database already contains {existing_count} reservations. Skipping.")
        return

    reservations_to_add = []

    sample_tables = random.sample(tables, min(len(tables), 10)) 

    for table in sample_tables:
        random_user = random.choice(users)
        random_date = datetime.utcnow() + timedelta(
            days=random.randint(1, 14), 
            hours=random.randint(1, 10)
        )
        
        new_reservation = Reservation(
            user_id=random_user.user_id,
            restaurant_id=table.restaurant_id,
            table_id=table.table_id,
            reservation_time=random_date,
            status=random.choice(list(ReservationStatusEnum))
        )
        reservations_to_add.append(new_reservation)

    session.add_all(reservations_to_add)
    session.commit()
    print(f"Successfully seeded {len(reservations_to_add)} reservations!")

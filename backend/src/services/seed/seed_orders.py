import random
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from ...models import Order, OrderItem, MenuItem, RestaurantTable, AppUser, Reservation
from ...models.enums import OrderStatusEnum, OrderSourceEnum, TableStatusEnum

def seed_orders(session: Session, max_orders: int = 30):
    tables = session.query(RestaurantTable).all()
    if not tables:
        raise ValueError("No tables in database! Run seed_tables first.")

    menu_items = session.query(MenuItem).all()
    if not menu_items:
        raise ValueError("No menu items in database! Run seed_menu_items first.")

    users = session.query(AppUser).all()
    if not users:
        raise ValueError("No users in database! Run seed_users first.")

    session.query(OrderItem).delete()
    session.query(Order).delete()
    session.commit()

    orders_to_add = []
    reservations = session.query(Reservation).all()
    occupied_tables = set()

    for _ in range(max_orders):
        source_roll = random.random()
        if source_roll < 0.65:
            source = OrderSourceEnum.QR_TABLE
        elif source_roll < 0.85:
            source = OrderSourceEnum.WEB_APP
        else:
            source = OrderSourceEnum.KIOSK

        table = random.choice(tables)
        
        attempts = 0
        while table.table_id in occupied_tables and attempts < 15:
            table = random.choice(tables)
            attempts += 1

        user = random.choice(users) if random.random() > 0.15 else None
        user_id = user.user_id if user else None

        res = None
        if user_id and reservations and random.random() > 0.7:
            user_reservations = [r for r in reservations if r.user_id == user_id and r.restaurant_id == table.restaurant_id]
            if user_reservations:
                res = random.choice(user_reservations)

        restaurant_menu = [mi for mi in menu_items if mi.restaurant_id == table.restaurant_id and mi.is_available]
        if not restaurant_menu:
            continue

        status_roll = random.random()
        if status_roll < 0.20:
            status = OrderStatusEnum.NEW
        elif status_roll < 0.45:
            status = OrderStatusEnum.PAID
        elif status_roll < 0.70:
            status = OrderStatusEnum.IN_PREPARATION
        elif status_roll < 0.90:
            status = OrderStatusEnum.READY
        else:
            status = OrderStatusEnum.CANCELED

        if source == OrderSourceEnum.KIOSK:
            table_id = None
            reservation_id = None
            user_id = None
        else:
            table_id = table.table_id
            reservation_id = res.reservation_id if res else None
            
            if status in [OrderStatusEnum.NEW, OrderStatusEnum.PAID, OrderStatusEnum.IN_PREPARATION]:
                occupied_tables.add(table.table_id)
                table.status = TableStatusEnum.OCCUPIED
                session.add(table)

        selected_items = random.sample(restaurant_menu, min(len(restaurant_menu), random.randint(1, 3)))
        
        order = Order(
            restaurant_id=table.restaurant_id,
            user_id=user_id,
            table_id=table_id,
            reservation_id=reservation_id,
            order_source=source,
            status=status,
            total_amount=Decimal("0.00"),
            created_at=datetime.now() - timedelta(days=random.randint(0, 3), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        )

        orders_to_add.append((order, selected_items))

    for order, selected_items in orders_to_add:
        session.add(order)
        session.flush()

        total_amount = Decimal("0.00")
        total_qty = 0
        max_total_qty = random.randint(1, 5) 

        for item in selected_items:
            remaining_qty = max_total_qty - total_qty
            if remaining_qty <= 0:
                break

            qty = random.randint(1, remaining_qty)
            item_total = item.price * qty

            total_qty += qty
            total_amount += item_total

            order_item = OrderItem(
                order_id=order.order_id,
                restaurant_id=order.restaurant_id,
                menu_item_id=item.menu_item_id,
                quantity=qty,
                unit_price=item.price,
                customization_notes=random.choice(["Bez cebuli", "Mocno ostre", "Sos osobno", None]) if random.random() > 0.85 else None
            )
            session.add(order_item)

        order.total_amount = total_amount

    session.commit()
    print(f"Successfully seeded {len(orders_to_add)} high-quality orders!")

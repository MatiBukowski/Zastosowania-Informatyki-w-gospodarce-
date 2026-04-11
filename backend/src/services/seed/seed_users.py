from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session
from ...models import AppUser, UserRoleEnum
from faker import Faker

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=4
)
fake = Faker('pl_PL')

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

USERS_DATA = [{
    "email": "jan.kowalski@example.com",
    "password_hash": get_password_hash("password"),
    "first_name": "Jan",
    "surname": "Kowalski",
    "phone_number": "123456789",
    "role": UserRoleEnum.ADMIN,
    "is_active": True
}]

def generate_fake_user(role: UserRoleEnum = UserRoleEnum.CUSTOMER) -> dict:
    fake_password = get_password_hash("password")

    return {
        "email": fake.email(),
        "password_hash": fake_password,
        "first_name": fake.first_name(),
        "surname": fake.last_name(),
        "phone_number": fake.phone_number(),
        "role": role,
        "is_active": True
    }

def seed_users(session: Session, count: int = 5):
    existing_count = session.query(AppUser).count()
    count = count - existing_count

    if count <= 0:
        print(f"Database already contains {existing_count} users. Skipping seeding.")
        return

    users_to_add = []

    for data in USERS_DATA[:count]:
        query = select(AppUser).where(AppUser.email == data["email"])
        user_exists = session.scalars(query).first()

        if not user_exists:
            users_to_add.append(AppUser(**data))

    remaining = count - len(users_to_add)
    roles_to_assign = []

    if remaining > 0:
        roles_to_assign.append(UserRoleEnum.CUSTOMER)
    if remaining > 1:
        roles_to_assign.append(UserRoleEnum.MANAGER)
    if remaining > 2:
        roles_to_assign.append(UserRoleEnum.WAITER)

    while len(roles_to_assign) < remaining:
        roles_to_assign.append(UserRoleEnum.CUSTOMER)

    for role in roles_to_assign:
        data = generate_fake_user(role)
        users_to_add.append(AppUser(**data))
    
    session.add_all(users_to_add)
    session.commit()
    print(f"Successfully seeded {len(users_to_add)} users!")

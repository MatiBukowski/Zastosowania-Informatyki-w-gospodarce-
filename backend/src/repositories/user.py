from backend.src.models.app_user import AppUser

class UserRepository:
    def __init__(self, db_session):
        self.db_session = db_session

    def get_by_email(self, email):
        return self.db_session.query(AppUser).filter_by(email=email).first()

    def create(self, user: AppUser):
        self.db_session.add(user)
        self.db_session.commit()
        return user
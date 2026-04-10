import jwt
import pytest

from src.security.token_provider import TokenProvider
from src.models.app_user import AppUser
from src.models.enums import UserRoleEnum

class TestTokenProvider:
   def setup_method(self):
      self.token_provider = TokenProvider()
      self.test_user = AppUser(user_id=1, email="abc123", role=UserRoleEnum.CUSTOMER)
      self.jwt_handler = jwt.JWT()
    
   def test_access_token_generation(self):
      token_provider = self.token_provider
      test_user = self.test_user

      access_token = token_provider.generate_access_token(test_user)
      decoded_payload = self.jwt_handler.decode(access_token, token_provider.jwt_key, algorithms=["HS256"])
      assert decoded_payload["user_id"] == test_user.user_id
      assert decoded_payload["email"] == test_user.email
      assert decoded_payload["role"] == test_user.role.value
      assert "exp" in decoded_payload

   def test_refresh_token_generation(self):
      token_provider = self.token_provider
      test_user = self.test_user

      refresh_token = token_provider.generate_refresh_token(test_user)
      decoded_payload = self.jwt_handler.decode(refresh_token, token_provider.jwt_key, algorithms=["HS256"])
      assert decoded_payload["user_id"] == test_user.user_id
      assert decoded_payload["email"] == test_user.email
      assert decoded_payload["role"] == test_user.role.value
      assert "exp" in decoded_payload

   def test_access_token_generation_from_refresh_token(self):
      token_provider = self.token_provider
      test_user = self.test_user

      refresh_token = token_provider.generate_refresh_token(test_user)
      new_access_token = token_provider.generate_access_token_from_refresh_token(refresh_token)
      decoded_payload = self.jwt_handler.decode(new_access_token, token_provider.jwt_key, algorithms=["HS256"])
      assert decoded_payload["user_id"] == test_user.user_id
      assert decoded_payload["email"] == test_user.email
      assert decoded_payload["role"] == test_user.role.value
      assert "exp" in decoded_payload

   def test_invalid_refresh_token(self):
      token_provider = self.token_provider
      invalid_token = "invalid.token.value"
      with pytest.raises(Exception): token_provider.generate_access_token_from_refresh_token(invalid_token)

   def test_expired_refresh_token(self):
      token_provider = self.token_provider
      test_user = self.test_user

      token_provider.REFRESH_TOKEN_EXPIRE_DAYS = -1
      expired_refresh_token = token_provider.generate_refresh_token(test_user)

      with pytest.raises(Exception): token_provider.generate_access_token_from_refresh_token(expired_refresh_token)
  
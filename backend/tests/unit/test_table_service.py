import pytest
import uuid
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from src.services import TableService
from src.schemas import TableCreate, TableUpdate
from src.models import RestaurantTable, TableStatusEnum


class TestTableService:
    
    def test_create_new_table_success(self):
        mock_repo = MagicMock()
        mock_repo.get_table_by_number.return_value = None 

        service = TableService(repo=mock_repo)
        table_data = TableCreate(table_number=5, capacity=4)

        mock_created_table = RestaurantTable(table_id=1, restaurant_id=1, table_number=5, capacity=4)
        mock_repo.create_table.return_value = mock_created_table

        result = service.create_new_table(restaurant_id=1, table_data=table_data)

        assert result == mock_created_table        
        mock_repo.get_table_by_number.assert_called_once_with(5, 1)
        mock_repo.create_table.assert_called_once()

    def test_create_new_table_duplicate_raises_400(self):
        mock_repo = MagicMock()
        existing_table = RestaurantTable(table_id=1, restaurant_id=1, table_number=5, capacity=4)
        mock_repo.get_table_by_number.return_value = existing_table

        service = TableService(repo=mock_repo)
        table_data = TableCreate(table_number=5, capacity=4)

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_table(restaurant_id=1, table_data=table_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Table number 5 already exists in this restaurant" in exc_info.value.detail
        mock_repo.create_table.assert_not_called()

    def test_update_existing_table_success(self):
        mock_repo = MagicMock()
        
        existing_table = RestaurantTable(
            table_id=1,
            restaurant_id=1,
            table_number=5,
            capacity=4,
            status=TableStatusEnum.FREE
        )
        mock_repo.get_table_by_id.return_value = existing_table
        mock_repo.update_table.return_value = existing_table

        service = TableService(repo=mock_repo)
        update_data = TableUpdate(capacity=5)

        result = service.update_existing_table(table_id=1, restaurant_id=1, table_data=update_data)

        assert result.capacity == 5
        mock_repo.update_table.assert_called_once()

    def test_update_existing_table_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_repo.get_table_by_id.return_value = None

        service = TableService(repo=mock_repo)
        update_data = TableUpdate(capacity=5)

        with pytest.raises(HTTPException) as exc_info:
            service.update_existing_table(table_id=1, restaurant_id=1, table_data=update_data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        mock_repo.update_table.assert_not_called()
    
    def test_update_existing_table_occupied_raises_400(self):
        mock_repo = MagicMock()
        
        occupied_table = RestaurantTable(
            table_id=1, restaurant_id=1, table_number=5, capacity=4, status=TableStatusEnum.OCCUPIED
        )
        mock_repo.get_table_by_id.return_value = occupied_table

        service = TableService(repo=mock_repo)
        update_data = TableUpdate(capacity=5)

        with pytest.raises(HTTPException) as exc_info:
            service.update_existing_table(table_id=1, restaurant_id=1, table_data=update_data)

        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Cannot update an occupied table" in exc_info.value.detail
        mock_repo.update_table.assert_not_called()

    def test_resolve_table_by_token_success(self):
        mock_repo = MagicMock()
        test_token = uuid.uuid4()
        mock_table = RestaurantTable(
            table_id=1, 
            restaurant_id=1, 
            table_number=5, 
            capacity=3,
            status=TableStatusEnum.FREE,
            qr_code_token=test_token
        )

        mock_repo.get_table_by_token.return_value = mock_table
        
        service = TableService(repo=mock_repo)
        result = service.resolve_table_by_token(test_token)

       
        assert result == mock_table
        mock_repo.get_table_by_token.assert_called_once_with(test_token)


    def test_resolve_table_by_token_not_found_raises_404(self):
        mock_repo = MagicMock()
        test_token = uuid.uuid4()
        mock_repo.get_table_by_token.return_value = None

        service = TableService(repo=mock_repo)
        with pytest.raises(HTTPException) as exc_info:
            service.resolve_table_by_token(test_token)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Invalid or expired QR token"
        
        mock_repo.get_table_by_token.assert_called_once_with(test_token)

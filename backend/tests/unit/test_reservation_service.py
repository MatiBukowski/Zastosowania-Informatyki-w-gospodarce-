import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta, UTC
from fastapi import HTTPException, status
from src.services import ReservationService
from src.schemas import ReservationCreate, ReservationUpdate
from src.models import Reservation, ReservationStatusEnum

class TestReservationService:

    def test_get_reservations_for_table_success(self):
        mock_repo = MagicMock()
        mock_table_service = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=mock_table_service)

        table_id = 1
        mock_reservations = [MagicMock(spec=Reservation), MagicMock(spec=Reservation)]
        mock_repo.get_reservations_by_table_id.return_value = mock_reservations

        result = service.get_reservations_for_table(table_id)

        assert result == mock_reservations
        mock_table_service.validate_table_exists.assert_called_once_with(table_id)
        mock_repo.get_reservations_by_table_id.assert_called_once_with(table_id)

    def test_get_reservation_success(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())

        mock_res = MagicMock(spec=Reservation)
        mock_repo.get_reservation_by_id.return_value = mock_res

        result = service.get_reservation(reservation_id=1)

        assert result == mock_res
        mock_repo.get_reservation_by_id.assert_called_once_with(1)

    def test_get_reservation_not_found_raises_404(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())
        mock_repo.get_reservation_by_id.return_value = None

        with pytest.raises(HTTPException) as exc_info:
            service.get_reservation(reservation_id=1)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Reservation with id=1 not found" in exc_info.value.detail

    def test_create_reservation_success(self):
        mock_repo = MagicMock()
        mock_table_service = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=mock_table_service)

        data = ReservationCreate(
            user_id=1,
            restaurant_id=1,
            table_id=1,
            reservation_time=datetime.now(UTC) + timedelta(days=1),
            status=ReservationStatusEnum.PENDING
        )
        mock_repo.get_overlapping_reservations.return_value = []
        mock_reservation = Reservation(reservation_id=10, **data.model_dump())
        mock_repo.create_reservation.return_value = mock_reservation

        result = service.create_new_reservation(data)

        assert result == mock_reservation
        mock_table_service.validate_table_exists.assert_called_once_with(data.table_id)
        mock_repo.get_overlapping_reservations.assert_called_once()
        mock_repo.create_reservation.assert_called_once()

    def test_create_reservation_overlap_raises_409(self):
        mock_repo = MagicMock()
        mock_table_service = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=mock_table_service)

        data = ReservationCreate(
            user_id=1,
            restaurant_id=1,
            table_id=1,
            reservation_time=datetime.now(UTC) + timedelta(days=1)
        )
        mock_repo.get_overlapping_reservations.return_value = [MagicMock(spec=Reservation)]

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_reservation(data)

        assert exc_info.value.status_code == status.HTTP_409_CONFLICT
        assert "Table is already reserved" in exc_info.value.detail
        mock_repo.create_reservation.assert_not_called()

    def test_create_reservation_table_not_found_raises_404(self):
        mock_repo = MagicMock()
        mock_table_service = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=mock_table_service)

        data = ReservationCreate(
            user_id=1,
            restaurant_id=1,
            table_id=999,
            reservation_time=datetime.now(UTC) + timedelta(days=1)
        )
        mock_table_service.validate_table_exists.side_effect = HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Table not found"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.create_new_reservation(data)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Table not found" in exc_info.value.detail

    def test_update_reservation_not_found_raises_404(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())
        mock_repo.get_reservation_by_id.return_value = None
        update_data = ReservationUpdate(status=ReservationStatusEnum.CONFIRMED)

        with pytest.raises(HTTPException) as exc_info:
            service.update_reservation(reservation_id=1, data=update_data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Reservation with id=1 not found" in exc_info.value.detail

    def test_update_reservation_status_only_success(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())
        
        existing_time = datetime.now(UTC) + timedelta(days=1)
        mock_res = Reservation(reservation_id=1, table_id=1, reservation_time=existing_time, status=ReservationStatusEnum.PENDING)
        mock_repo.get_reservation_by_id.return_value = mock_res
        
        update_data = ReservationUpdate(status=ReservationStatusEnum.CONFIRMED)
        
        service.update_reservation(reservation_id=1, data=update_data)

        assert mock_res.status == ReservationStatusEnum.CONFIRMED
        mock_repo.get_overlapping_reservations.assert_not_called()
        mock_repo.update_reservation.assert_called_once_with(mock_res)

    def test_update_reservation_time_overlap_raises_409(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())
        
        existing_time = datetime.now(UTC) + timedelta(days=1)
        new_time = existing_time + timedelta(hours=1)
        
        mock_res = Reservation(reservation_id=1, table_id=1, reservation_time=existing_time)
        mock_repo.get_reservation_by_id.return_value = mock_res
        mock_repo.get_overlapping_reservations.return_value = [MagicMock(spec=Reservation)]

        update_data = ReservationUpdate(reservation_time=new_time)

        with pytest.raises(HTTPException) as exc_info:
            service.update_reservation(reservation_id=1, data=update_data)

        assert exc_info.value.status_code == status.HTTP_409_CONFLICT
        mock_repo.update_reservation.assert_not_called()

    def test_update_reservation_valid_time_change_success(self):
        mock_repo = MagicMock()
        service = ReservationService(repo=mock_repo, table_service=MagicMock())
        
        existing_time = datetime.now(UTC) + timedelta(days=1)
        new_time = existing_time + timedelta(hours=5)
        
        mock_res = Reservation(reservation_id=1, table_id=1, reservation_time=existing_time)
        mock_repo.get_reservation_by_id.return_value = mock_res
        mock_repo.get_overlapping_reservations.return_value = []

        update_data = ReservationUpdate(reservation_time=new_time)
        service.update_reservation(reservation_id=1, data=update_data)

        assert mock_res.reservation_time == new_time
        mock_repo.update_reservation.assert_called_once_with(mock_res)


from enum import Enum

class OrderSourceEnum(str, Enum):
    KIOSK = "KIOSK"
    WEB_APP = "WEB_APP"
    QR_TABLE = "QR_TABLE"


class OrderStatusEnum(str, Enum):
    NEW = "NEW"
    PAID = "PAID"
    IN_PREPARATION = "IN_PREPARATION"
    READY = "READY"
    CANCELED = "CANCELED"


class ReservationStatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"


class TableStatusEnum(str, Enum):
    FREE = "FREE"
    OCCUPIED = "OCCUPIED"
    RESERVED = "RESERVED"

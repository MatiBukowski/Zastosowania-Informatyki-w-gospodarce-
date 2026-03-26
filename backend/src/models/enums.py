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


class UserRoleEnum(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    WAITER = "WAITER"
    CUSTOMER = "CUSTOMER"


class CuisineTyupeEnum(str, Enum):
    ITALIAN = "ITALIAN"
    AMERICAN = "AMERICAN"
    POLISH = "POLISH"
    MEDITERRANEAN = "MEDITERRANEAN"
    GREEK = "GREEK"
    FRENCH = "FRENCH"
    SPANISH = "SPANISH"
    ASIAN = "ASIAN"
    JAPANESE = "JAPANESE"
    INDIAN = "INDIAN"
    KEBAB = "KEBAB"
    MEXICAN = "MEXICAN"
    VEGAN = "VEGAN"
    FUSION = "FUSION"
    OTHER = "OTHER"

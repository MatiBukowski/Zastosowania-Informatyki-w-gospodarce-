from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class ForecastBase(BaseModel):
    historical: list[tuple[datetime, Decimal]] = Field(
        default_factory=list,
        description="List of (timestamp, value) pairs representing historical data points",
    )
    forecast: list[list[Decimal]] = Field(
        default_factory=list,
        description="Nested list of forecasted mean values for future time steps",
    )
    quantile_forecast: list[list[list[Decimal]]] = Field(
        default_factory=list,
        description=(
            "3D list of quantile forecast values: "
            "[time_steps][quantile_levels][quantile_values]"
        ),
    )

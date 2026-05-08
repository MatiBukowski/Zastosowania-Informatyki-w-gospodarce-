from fastapi import Depends
import numpy as np

from exceptions import ForecastGeneratingException
from ..schemas.forecast import ForecastBase
from ..repositories import PosthogRepository

_enabled = True

try:
    import timesfm
    import torch
except ImportError:
    print("Please install timesfm and torch")
    _enabled = False

if _enabled:
    torch.set_float32_matmul_precision("high")
    model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
        "google/timesfm-2.5-200m-pytorch"
    )
    model.compile(
        timesfm.ForecastConfig(
            max_context=512,
            max_horizon=8,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
        )
    )

class ForecastService:
    def __init__(self, repo: PosthogRepository = Depends()):
        self.repo = repo

    def get_forecast(self, restaurant_id: int) -> ForecastBase:
        results = self.repo.get_insight_by_restaurant_id(restaurant_id)

        if not _enabled:
            return ForecastBase(
                historical=results,
                forecast=[],
                quantile_forecast=[],
            )

        try:
            point_forecast, quantile_forecast = model.forecast(
                horizon=8,
                inputs=[
                    [result[1] for result in results],
                ],
            )
            point_forecast = np.nan_to_num(point_forecast, nan=0.0)
            quantile_forecast = np.nan_to_num(quantile_forecast, nan=0.0)
            return ForecastBase(
                historical=results,
                forecast=point_forecast.tolist(),
                quantile_forecast=quantile_forecast.tolist(),
            )
        except Exception as e:
            raise ForecastGeneratingException(f"Error generating forecast: {e}")
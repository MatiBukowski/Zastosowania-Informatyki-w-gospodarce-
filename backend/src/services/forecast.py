from fastapi import HTTPException, status
import numpy as np
import timesfm
import torch

torch.set_float32_matmul_precision("high")
model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
    "google/timesfm-2.5-200m-pytorch"
)
model.compile(
    timesfm.ForecastConfig(
        max_context=1024,
        max_horizon=256,
        normalize_inputs=True,
        use_continuous_quantile_head=True,
        force_flip_invariance=True,
        infer_is_positive=True,
        fix_quantile_crossing=True,
    )
)

class ForecastService:
    def __init__(self):
        pass

    def get_forecast(self):
        try:
            point_forecast, quantile_forecast = model.forecast(
                horizon=12,
                inputs=[
                    _pad_to_length(np.linspace(0, 1, 100), 1024),
                    _pad_to_length(np.sin(np.linspace(0, 20, 67)), 1024),
                ],
            )
            point_forecast = np.nan_to_num(point_forecast, nan=0.0)
            quantile_forecast = np.nan_to_num(quantile_forecast, nan=0.0)
            return {
                "forecast": point_forecast.tolist(),
                "quantile_forecast": quantile_forecast.tolist(),
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating forecast: {e}"
            )


def _pad_to_length(arr: np.ndarray, target_len: int) -> np.ndarray:
    """Pad a 1D array to target_len by repeating/tiling it."""
    if len(arr) >= target_len:
        return arr[-target_len:]  # take last N if too long
    repeats = int(np.ceil(target_len / len(arr)))
    return np.tile(arr, repeats)[:target_len]
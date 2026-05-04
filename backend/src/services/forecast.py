from fastapi import HTTPException, status
import numpy as np
import timesfm

model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch", torch_compile=True)

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
                    np.linspace(0, 1, 100),
                    np.sin(np.linspace(0, 20, 67)),
                ],  # Two dummy inputs
            )
            return point_forecast
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating forecast: {e}"
            )

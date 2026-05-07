import requests
import json

from ..config import Settings

class PosthogRepository:
    def __init__(self):
        self.url = f"https://eu.posthog.com/api/projects/{Settings.POSTHOG_ID}/query/"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {Settings.POSTHOG_PAT_KEY}'
        }

    def get_insight_by_restaurant_id(self, restaurant_id: int):
        query = f"""
        WITH date_range AS (
            SELECT toStartOfDay(today() - toIntervalDay(number)) AS day
            FROM numbers(512)
        )
        SELECT
            dr.day,
            coalesce(e.visitors, 0) AS visitors
        FROM date_range dr
        LEFT JOIN (
            SELECT
                toStartOfDay(timestamp) AS day,
                count(*) AS visitors
            FROM events
            WHERE
                event = 'reservation_button_clicked' AND
                properties.restaurant_id = {restaurant_id}
            GROUP BY day
        ) e ON dr.day = e.day
        ORDER BY dr.day
        LIMIT 512
        """

        payload = {
            "query": {
                "kind": "HogQLQuery",
                "query": query
            },
            "name": "Get previous 512 days visitors"
        }
        response = requests.post(self.url, headers=self.headers, data=json.dumps(payload))
        return response.json()["results"]


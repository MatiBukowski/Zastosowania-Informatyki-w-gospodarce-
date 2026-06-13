#!/bin/sh

# Run migrations
if [ "$RUN_MIGRATION" = "true" ]; then
  alembic upgrade head
fi

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8080

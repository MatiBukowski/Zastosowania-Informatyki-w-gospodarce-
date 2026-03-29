### Backend Development Guide

This document provides instructions on how to work with Alembic migrations and run tests using Pytest.

---

### Alembic Migration Preparation

Alembic is used for database migrations. All migration commands should be run from the `backend/` directory.

#### 1. Configuration
Alembic is configured via `alembic.ini` and `migrations/env.py`. It uses the database connection URL from the environment variables (via `src/config.py`). Ensure your `.env` file contains the correct PostgreSQL credentials.

#### 2. Generating a New Migration
When you change your SQLAlchemy models in `src/models/`, you need to generate a new migration script:

```shell
# From backend/ directory
alembic revision --autogenerate -m "description_of_changes"
```

**Note:** Always review the generated script in `backend/migrations/versions/` to ensure it correctly reflects your changes.

#### 3. Applying Migrations
To update your database to the latest version:

```shell
alembic upgrade head
```

To revert the last migration:

```shell
alembic downgrade -1
```

---

### Running Tests with Pytest

Tests are located in the `backend/tests/` directory.

#### 1. Running All Tests
From the `backend/` directory, simply run:

```shell
pytest
```
# System Project

## System architecture diagram

```mermaid
flowchart TB
  subgraph VPS["VPS (Docker)"]
    subgraph FE["Frontends"]
      M["Mobile App<br/>React Native"]
      W["Desktop Web App<br/>React"]
    end

    subgraph BE["Backend"]
      API["FastAPI"]
    end

    DB[(PostgreSQL)]
  end

  M -->|"HTTPS API calls"| API
  W -->|"HTTPS API calls"| API
  API -->|"SQLAlchemy"| DB
```

## Actors

From what I see we can have four actors inside our app:

1. Customer - a person that can order some food, order a certain table etc.
2. Waiter - a person that can pick up orders from customers.
3. Data Manager - a person who can see the data display on web version of this system.
4. Admin - a person with specified access to whole system.

## Backend design

### Folder structure

```
backend/
├── src/
│   ├── repositories/
│   ├── models/               # Database models
│   ├── controllers/          # API endpoints
│   └── services/             # Complex business logic
└── tests/
    ├── unit_tests/           # Test individual functions and services
    └── component_tests/      # Test API endpoints and service integration
```

### Flow example (TO BE DONE)

## Frontend design

### Folder structure

```
frontend/
├── mobile/            # Mobile side
├── shared/            # Shared files for web and mobile versions
└── web/               # Web side
```

---

#### Web

```
frontend/web/src/
├── views/              # Full page components (OrdersPage.tsx, etc)
├── components/         # Reusable UI components (OrderCard, Button, etc)
├── hooks/              # Custom hooks for API calls, should use frontend/shared/api/API.ts
├── services/           # Business logic combining multiple hooks
└── App.tsx
```

---

#### Shared

```
frontend/shared/
├── api/
│   └── API.ts          # Single centralized API client
├── context/
│   └── types.ts        # Shared TypeScript types/interfaces
├── theme/              # Theme configuration (Material UI)
└── README.md
```

---

#### Mobile (TO BE SPECIFIED)

### Key Rules

1. **One hook per domain**: `useOrderAPI`, `useUserAPI`, not `fetchOrder.ts`
2. **Types are shared**: Keep them in `frontend/shared/context/types.ts`
3. **API client is centralized**: Use `frontend/shared/api/API.ts` everywhere
4. **Services are optional**: Only create if logic is complex or reused
5. **Components are dumb**: They consume hooks/services, don't call API directly
6. **Hooks are the bridge**: Between API and components

---

### Abstraction level specification

#### ❌ BAD: Too granular

```
ordersAPI/
├── fetchOrder.ts
├── postOrder.ts
├── updateOrder.ts
└── deleteOrder.ts
```

#### ✅ GOOD: Single hook per domain

```
hooks/
└── useOrderAPI.ts      # Contains all Order operations
```

---

## Database design

### Physical Model

```mermaid
erDiagram
  USER {
    int user_id PK
    varchar email
    varchar password_hash
    varchar first_name
    varchar surname
    varchar phone_number
    enum role "ADMIN|MANAGER|WAITER|CUSTOMER"
    boolean is_active
  }

  RESTAURANT {
    int restaurant_id PK
    varchar name
    varchar address
    boolean has_kiosk
    enum cuisine "ITALIAN|AMERICAN|POLISH|MEDITERRANEAN|GREEK|FRENCH|SPANISH|ASIAN|JAPANESE|INDIAN|KEBAB|MEXICAN|VEGAN|FUSION|OTHER"
    varchar photo
    boolean is_active
  }

  TABLE {
    int table_id PK
    int restaurant_id FK
    int table_number
    varchar qr_code_token
    int capacity
    enum status "FREE|OCCUPIED|RESERVED"
  }

  MENU_ITEM {
    int menu_item_id PK
    int restaurant_id FK
    varchar name
    text description
    decimal price
    boolean is_available
  }

  "ORDER" {
    int order_id PK
    int restaurant_id FK
    int user_id FK  "nullable"
    int table_id FK "nullable"
    int reservation_id FK "nullable"
    enum order_source "KIOSK|WEB_APP|QR_TABLE"
    enum status "NEW|PAID|IN_PREPARATION|READY|CANCELED"
    decimal total_amount
    datetime created_at
  }

  ORDER_ITEM {
    int order_item_id PK
    int order_id FK
    int menu_item_id FK
    int quantity
    decimal unit_price
    text customization_notes
  }

  RESERVATION {
    int reservation_id PK
    int user_id FK
    int restaurant_id FK
    int table_id FK
    datetime reservation_time
    varchar status
  }

  RESTAURANT ||--o{ TABLE : has
  RESTAURANT ||--o{ MENU_ITEM : offers
  RESTAURANT ||--o{ "ORDER" : receives
  RESTAURANT ||--o{ RESERVATION : receives

  USER ||--o{ RESERVATION : makes
  USER ||--o{ "ORDER" : places

  TABLE ||--o{ RESERVATION : reserved_for
  TABLE ||--o{ "ORDER" : serves

  RESERVATION ||--o{ "ORDER" : produces

  "ORDER" ||--o{ ORDER_ITEM : contains
  MENU_ITEM ||--o{ ORDER_ITEM : appears_in
```

### ORM

As for object relational mapper SQLAlchemy will be used.

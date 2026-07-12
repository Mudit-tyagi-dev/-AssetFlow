# AssetFlow Backend API

AssetFlow is a multi-tenant Enterprise Asset & Resource Management ERP system backend built using FastAPI, PostgreSQL, SQLAlchemy 2.0 (Async), Alembic, and Pydantic v2.

---

## 1. Tech Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database ORM:** SQLAlchemy 2.0 (Async) & `asyncpg`
- **Database Migrations:** Alembic
- **Schemas & Settings:** Pydantic v2 & `pydantic-settings`
- **Security:** Hashing via PyNaCl/bcrypt & JWT Authentication (Access/Refresh Tokens)
- **Testing:** Pytest, pytest-asyncio, HTTPX AsyncClient & aiosqlite (for in-memory isolation)
- **ID Strategy:** Application-level UUIDv7 (ordered UUIDs)

---

## 2. Setup & Installation

### Prerequisites
- Python 3.11 or higher
- PostgreSQL database (or SQLite fallback for testing)

### Step 1: Clone and Set Up Virtual Environment
Navigate to the `backend` folder and initialize a virtual environment:
```bash
cd backend
python -m venv .venv
# Activate on Windows:
.venv\Scripts\activate
# Activate on Unix/macOS:
source .venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` root folder:
```ini
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/assetflow
SECRET_KEY=super-secret-jwt-signing-key-replace-in-production
REFRESH_SECRET_KEY=super-secret-refresh-token-signing-key-replace-in-production
CORS_ORIGINS=["http://localhost:3000"]
```

### Step 4: Run Migrations
Generate the schema in PostgreSQL using Alembic:
```bash
alembic upgrade head
```

### Step 5: Seed Demo Data
Populate the database with a dummy organization, test users, departments, categories, and assets:
```bash
python seed.py
```
This inserts the following accounts (all passwords are `<role>12345`):
- **Admin:** `admin@acme.com` / `admin12345`
- **Asset Manager:** `manager@acme.com` / `manager12345`
- **Department Head:** `head@acme.com` / `head12345`
- **Employee:** `employee@acme.com` / `employee12345`

### Step 6: Start Server
```bash
uvicorn app.main:app --reload
```
Interactive Swagger documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Step 7: Expose Server Publicly (Optional)
To share or test the API externally using **ngrok**:
1. Get an authtoken by signing up at [ngrok.com](https://ngrok.com/).
2. Add your authtoken to your `.env` file:
   ```ini
   NGROK_AUTHTOKEN=your_ngrok_authtoken_here
   ```
3. Run the tunnel helper script:
   ```bash
   python tunnel.py
   ```
   This will automatically start a tunnel to port 8000 and print your public HTTP URL.

---

## 3. Testing Suite

The backend uses pytest with a SQLite in-memory database. All Postgres-specific constraints (e.g. `ExcludeConstraint` and partial indexes) are automatically stripped in memory at runtime to allow full compatibility.

Run all tests:
```bash
python -m pytest
```

---

## 4. RBAC Authorization Matrix

| Resource / Endpoint | Operation | Admin | Asset Manager | Department Head | Employee |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Organization & Users** | Create Org / Dept / User | Yes | No | No | No |
| | Deactivate Dept / User | Yes | No | No | No |
| **Asset Categories** | Create / Update Category | Yes | Yes | No | No |
| **Assets** | Register / Edit / Delete Asset | Yes | Yes | No | No |
| | View Asset List / Details | Yes | Yes | Yes | Yes |
| | View Asset History | Yes | Yes | Yes | No |
| **Allocations** | Checkout / Return Asset | Yes | Yes | No | No |
| | Request Transfer | Yes | Yes | Yes | Yes |
| | Approve / Reject Transfer | Yes | Yes | No | No |
| **Resource Bookings** | Book / Reschedule / Cancel | Yes | Yes | Yes | Yes |
| **Maintenance** | Raise Request | Yes | Yes | Yes | Yes |
| | Approve / Assign / Resolve Request | Yes | Yes | No | No |
| **Audits** | Create / Start / Close Cycle | Yes | Yes | No | No |
| | Verify Audit Items | Yes | Yes | No (unless Auditor) | No (unless Auditor) |
| **System Audit Logs** | View compliance logs | Yes | No | No | No |

---

## 5. Database Schema ERD

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ DEPARTMENTS : contains
    ORGANIZATIONS ||--o{ USERS : has
    ORGANIZATIONS ||--o{ ASSET_CATEGORIES : defines
    ORGANIZATIONS ||--o{ ASSETS : owns
    ORGANIZATIONS ||--o{ AUDIT_CYCLES : schedules
    ORGANIZATIONS ||--o{ NOTIFICATIONS : triggers
    ORGANIZATIONS ||--o{ ACTIVITY_LOGS : records

    DEPARTMENTS ||--o{ USERS : groups
    DEPARTMENTS ||--o{ ASSETS : holds

    USERS ||--o{ ASSETS : holds
    USERS ||--o{ ASSET_ALLOCATIONS : manages
    USERS ||--o{ TRANSFER_REQUESTS : requests
    USERS ||--o{ RESOURCE_BOOKINGS : schedules
    USERS ||--o{ MAINTENANCE_REQUESTS : reports
    USERS ||--o{ AUDIT_CYCLES : audited_by
    USERS ||--o{ NOTIFICATIONS : receives

    ASSET_CATEGORIES ||--o{ ASSETS : classifies

    ASSETS ||--o{ ASSET_ALLOCATIONS : tracks
    ASSETS ||--o{ TRANSFER_REQUESTS : tracks
    ASSETS ||--o{ RESOURCE_BOOKINGS : schedules
    ASSETS ||--o{ MAINTENANCE_REQUESTS : undergoes
    ASSETS ||--o{ AUDIT_ITEMS : verified_in
```
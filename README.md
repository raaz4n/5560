# MetaBooks
### A Full-Stack Library Management System

MetaBooks is a full-stack library management system for tracking books, members, loans, fines, and reservations. It includes a personalized book recommendation engine based on each member's reading history.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MySQL 8+ |
| Backend | Python 3.10+ / FastAPI / Uvicorn |
| Frontend | React 18 / TypeScript / Vite / Tailwind CSS |
| Auth | JWT (python-jose) + bcrypt |

---

## Project Structure

```
5560-main/
├── database/
│   ├── Library_DB_new.sql        ← Run this first (schema + seed data)
│   ├── MEMBERS.sql               ← Member records
│   └── books_insert.sql          ← Book catalog (~7,000 books)
├── backend/
│   ├── main.py                   ← Core FastAPI app
│   ├── recommendations_router.py ← Recommendations feature
│   ├── run_with_recs.py          ← Entry point (use this to run)
│   └── requirements.txt
└── frontend/
    └── src/app/
        ├── pages/                ← Page components
        ├── components/           ← Shared components (NavBar, Auth)
        └── hooks/                ← Custom React hooks
```

---

## Prerequisites

- MySQL 8+
- Python 3.10+
- Node.js 18+ (includes npm)

---

## Getting Started

### Step 1 — Database

Open MySQL Workbench and run:

```sql
CREATE DATABASE LIBRARY;
USE LIBRARY;
```

Then open and run the following SQL script:

`database/Library_DB_new.sql`


### Step 2 — Backend Configuration

Open `backend/main.py` **and** `backend/recommendations_router.py`. In both files, find the `get_db()` function and replace the password placeholder:

```python
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_mysql_password_here",  # ← update this
        database="LIBRARY",
        auth_plugin="mysql_native_password"
    )
```

### Step 3 — Run the Backend

Open a terminal in the backend folder:

```bash
cd 5560-main/backend
pip install -r requirements.txt
uvicorn run_with_recs:app --reload
```

> API available at **http://localhost:8000**  
> Interactive docs at **http://localhost:8000/docs**

### Step 4 — Run the Frontend

Open a **second terminal** in the frontend folder:

```bash
cd 5560-main/frontend
npm install
npm run dev
```

> App available at **http://localhost:5173**

---

If you would like to view the system through an administrator view, use the following login:
test@email.com
123

## Database Schema

| Table | Primary Key | Description |
|-------|-------------|-------------|
| `PUBLISHER` | `Publisher_id` | Publishing house names and countries |
| `AUTHOR` | `Author_id` | Author names |
| `BOOK` | `Book_id` | Book catalog including ISBN, stock, genre |
| `MEMBERS` | `Member_id` | Registered patrons with hashed passwords and roles |
| `LOAN` | `Loan_id` | Borrowed books, due dates, return status |
| `FINE` | `Fine_id` | Financial penalties linked to loans |
| `BOOK_AUTHOR` | `(Book_id, Author_id)` | Junction table: books to authors |

---

## Member Roles

| Role | Access |
|------|--------|
| `member` | Browse catalog, reserve books, view own loans/fines |
| `librarian` | All member access + Circulation Desk, Member Lookup, Fines Desk |
| `admin` | Full access including user management, book management, library stats |

---

## Recommendations Feature

Logged-in members see a **"For You"** link in the navbar. The engine scores unread, in-stock books based on the member's loan history:

| Signal | Points |
|--------|--------|
| Genre match | +3 |
| Author match | +2 |
| Publisher match | +1 |

The top 5 scoring books are returned. Recommendations require at least one completed loan (`Status = 'returned'`) in the member's history.

To manually add loan history for testing:

```sql
USE LIBRARY;
INSERT INTO LOAN (Member_id, Book_id, Loan_date, Due_date, Status)
VALUES (your_member_id, book_id, '2026-01-01', '2026-01-15', 'returned');
```

---

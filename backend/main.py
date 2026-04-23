from fastapi import FastAPI, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt
from datetime import datetime, timedelta, date
import mysql.connector

# CONFIG

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="main_test",         # your MySQL username
        password="superpassword",     # your MySQL password
        database="LIBRARY",
        auth_plugin="mysql_native_password" # needed for some MySQL setups, adjust if necessary
    )


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# FASTAPI APP

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MODELS

class User(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RoleUpdate(BaseModel):
    new_role: str


class UserEdit(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    phone: str | None = None
    address: str | None = None


class BookCreate(BaseModel):
    ISBN: str
    Title: str
    Publish_year: int
    Total_stock: int
    Avail_stock: int
    Genre: str | None = None
    Publisher_id: int | None = None


class BookEdit(BaseModel):
    Title: str | None = None
    Publish_year: int | None = None
    Total_stock: int | None = None
    Avail_stock: int | None = None
    Genre: str | None = None
    Publisher_id: int | None = None


class LoanCreate(BaseModel):
    Book_id: int
    Member_id: int
    Loan_date: date
    Due_date: date

# AUTH HELPERS

def get_current_user(access_token: str | None):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM MEMBERS WHERE Email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def require_admin(user: dict):
    if (user.get("Member_role") or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

def require_librarian_or_admin(user: dict):
    role = (user.get("Member_role") or "").lower()
    if role not in ("admin", "librarian"):
        raise HTTPException(status_code=403, detail="Librarian or admin access required")
    
def update_fines_for_member(member_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # 1. Mark overdue loans
    cursor.execute("""
        UPDATE loan
        SET Return_status = 'Overdue'
        WHERE Member_id = %s
          AND Return_date IS NULL
          AND Due_date < CURDATE()
    """, (member_id,))
    db.commit()

    # 2. Insert fines for newly overdue loans (no duplicates)
    cursor.execute("""
        INSERT INTO fine (Loan_id, Fine_amount, Payment_date, Paid_status)
        SELECT 
            l.Loan_id,
            CEIL(DATEDIFF(CURDATE(), l.Due_date) / 30) * 15 AS Fine_amount,
            NULL AS Payment_date,
            'Unpaid' AS Paid_status
        FROM loan l
        LEFT JOIN fine f ON f.Loan_id = l.Loan_id
        WHERE l.Member_id = %s
        AND l.Return_date IS NULL
        AND l.Due_date < CURDATE()
        AND f.Loan_id IS NULL
    """, (member_id,))
    db.commit()

    # 3. Update existing fines
    cursor.execute("""
        UPDATE fine f
        JOIN loan l ON f.Loan_id = l.Loan_id
        SET f.Fine_amount = CEIL(DATEDIFF(CURDATE(), l.Due_date) / 30) * 15
        WHERE l.Member_id = %s
        AND l.Return_date IS NULL
        AND l.Due_date < CURDATE()
        AND f.Paid_status = 'Unpaid'
    """, (member_id,))
    db.commit()

    cursor.close()
    db.close()


# AUTH ROUTES

@app.post("/signup")
def signup(user: User):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM MEMBERS WHERE Email = %s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    cursor.execute("SELECT MAX(Member_id) AS max_id FROM MEMBERS")
    result = cursor.fetchone()
    next_id = (result["max_id"] or 0) + 1

    cursor.execute("""
        INSERT INTO MEMBERS (Member_id, First_name, Last_name, Email, Phone_number, Address,
                             Password_hash, Join_date, Member_role)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        next_id,
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.address,
        hashed_pw,
        datetime.now().date(),
        "regular"
    ))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "User created successfully"}


@app.post("/signin")
def signin(login: LoginRequest, response: Response):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM MEMBERS WHERE Email = %s", (login.email,))
    user = cursor.fetchone()

    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not bcrypt.checkpw(login.password.encode("utf-8"), user["Password_hash"].encode("utf-8")):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({"sub": login.email})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return {"message": "Login successful"}


@app.get("/me")
def me(access_token: str = Cookie(None)):
    user = get_current_user(access_token)
    user.pop("Password_hash", None)
    return user

@app.post("/logout")
def logout():
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

# MEMBER: PERSONAL LOANS & FINES

@app.get("/loans/member/{member_id}")
def get_member_loans(member_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    if not current:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if current["Member_id"] != member_id and current["Member_role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        UPDATE loan
        SET Return_status = 'Overdue'
        WHERE Member_id = %s
          AND Return_date IS NULL
          AND Due_date < CURDATE()
    """, (member_id,))
    db.commit()

    cursor.execute("""
        SELECT 
            l.Loan_id,
            l.Book_id,
            b.Title,
            b.Genre,
            l.Loan_date,
            l.Due_date,
            l.Return_date,
            CASE
                WHEN l.Return_date IS NULL AND l.Due_date < CURDATE() THEN 'Overdue'
                WHEN l.Return_date IS NULL THEN 'Borrowed'
                ELSE 'Returned'
            END AS Status
        FROM loan l
        JOIN book b ON b.Book_id = l.Book_id
        WHERE l.Member_id = %s
        ORDER BY l.Loan_date DESC
    """, (member_id,))

    loans = cursor.fetchall()

    cursor.close()
    db.close()

    return loans

@app.get("/fines/member/{member_id}")
def get_member_fines(member_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    if not current:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if current["Member_id"] != member_id and current["Member_role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")

    update_fines_for_member(member_id)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            f.Fine_id,
            f.Loan_id,
            f.Fine_amount,
            f.Payment_date,
            f.Paid_status,
            l.Book_id,
            b.Title,
            b.Genre,
            l.Loan_date,
            l.Due_date,
            l.Return_date,
            CASE
                WHEN l.Return_date IS NULL AND l.Due_date < CURDATE() THEN 'Overdue'
                WHEN l.Return_date IS NULL THEN 'Borrowed'
                ELSE 'Returned'
            END AS Loan_status
        FROM fine f
        JOIN loan l ON f.Loan_id = l.Loan_id
        JOIN book b ON b.Book_id = l.Book_id
        WHERE l.Member_id = %s
        ORDER BY f.Fine_id DESC
    """, (member_id,))

    fines = cursor.fetchall()

    cursor.close()
    db.close()

    return fines

# PUBLIC BOOK ROUTES

@app.get("/books")
def get_books(search: str = "", genre: str = "", availability: str = ""):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT b.Book_id, b.ISBN, b.Title, b.Publish_year,
               b.Total_stock, b.Avail_stock, b.Genre,
               p.Publisher_name,
               GROUP_CONCAT(CONCAT(a.First_name, ' ', a.Last_name) SEPARATOR ', ') AS authors
        FROM book b
        LEFT JOIN publisher p ON b.Publisher_id = p.Publisher_id
        LEFT JOIN book_author ba ON b.ISBN = ba.ISBN
        LEFT JOIN author a ON ba.Author_id = a.Author_id
        WHERE 1=1
    """
    params = []

    if search:
        like = f"%{search}%"
        query += """ AND (
            b.Title LIKE %s OR
            b.ISBN LIKE %s OR
            p.Publisher_name LIKE %s OR
            CONCAT(a.First_name, ' ', a.Last_name) LIKE %s
        )"""
        params.extend([like, like, like, like])

    if genre and genre != "all":
        query += " AND b.Genre = %s"
        params.append(genre)

    if availability == "available":
        query += " AND b.Avail_stock > 0"
    elif availability == "unavailable":
        query += " AND b.Avail_stock = 0"

    query += " GROUP BY b.Book_id LIMIT 100"

    cursor.execute(query, params)
    books = cursor.fetchall()

    cursor.close()
    db.close()
    return books


@app.get("/genres")
def get_genres():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT DISTINCT Genre FROM book WHERE Genre IS NOT NULL ORDER BY Genre")
    genres = [row[0] for row in cursor.fetchall()]
    cursor.close()
    db.close()
    return genres

# ADMIN: USER MANAGEMENT

@app.get("/admin/users")
def admin_get_users(
    access_token: str = Cookie(None),
    search: str | None = None,
    limit: int = 50,
    offset: int = 0
):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT Member_id, First_name, Last_name, Email, Phone_number, Address,
               Join_date, Member_role
        FROM MEMBERS
    """

    params = []

    if search:
        query += """
            WHERE Member_id LIKE %s
               OR First_name LIKE %s
               OR Last_name LIKE %s
               OR Email LIKE %s
        """
        like = f"%{search}%"
        params.extend([like, like, like, like])

    query += " ORDER BY Member_role, Last_name LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)
    users = cursor.fetchall()

    cursor.close()
    db.close()

    return users


@app.put("/admin/users/{member_id}/role")
def update_user_role(
    member_id: int,
    data: RoleUpdate,
    access_token: str = Cookie(None)
):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE MEMBERS
        SET Member_role = %s
        WHERE Member_id = %s
    """, (data.new_role, member_id))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Role updated successfully"}


@app.put("/admin/users/{member_id}")
def admin_update_user(
    member_id: int,
    data: UserEdit,  
    access_token: str = Cookie(None)
):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        UPDATE MEMBERS
        SET First_name = %s,
            Last_name = %s,
            Phone_number = %s,
            Address = %s
        WHERE Member_id = %s
    """, (
        data.firstName,
        data.lastName,
        data.phone,
        data.address,
        member_id
    ))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "User updated successfully"}


@app.delete("/admin/users/{member_id}")
def delete_user(member_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM MEMBERS WHERE Member_id = %s", (member_id,))
    db.commit()
    cursor.close()
    db.close()

    return {"message": "User deleted"}

# ADMIN: BOOK MANAGEMENT

@app.get("/admin/books")
def admin_get_books(
    access_token: str = Cookie(None),
    search: str | None = None,
    limit: int = 50,
    offset: int = 0
):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Base query
    query = """
        SELECT
            b.Book_id,
            b.ISBN,
            b.Title,
            b.Publish_year,
            b.Total_stock,
            b.Avail_stock,
            b.Genre,
            b.Publisher_id,
            p.Publisher_name
        FROM book b
        LEFT JOIN publisher p ON b.Publisher_id = p.Publisher_id
    """

    params = []

    # Search filter
    if search:
        query += """
            WHERE b.Title LIKE %s
               OR b.ISBN LIKE %s
               OR b.Genre LIKE %s
               OR p.Publisher_name LIKE %s
        """
        like = f"%{search}%"
        params.extend([like, like, like, like])

    # Pagination
    query += " ORDER BY b.Title LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)
    books = cursor.fetchall()

    cursor.close()
    db.close()

    return books


@app.post("/admin/books-add")
def admin_add_book(book: BookCreate, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        INSERT INTO book (ISBN, Title, Publish_year, Total_stock, Avail_stock, Genre, Publisher_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        book.ISBN,
        book.Title,
        book.Publish_year,
        book.Total_stock,
        book.Avail_stock,
        book.Genre,
        book.Publisher_id
    ))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book added successfully"}

@app.get("/admin/publishers")
def get_publishers(
    access_token: str = Cookie(None),
    search: str | None = None,
    limit: int = 20,
    offset: int = 0
):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = "SELECT Publisher_id, Publisher_name FROM publisher"
    params = []

    if search:
        query += " WHERE Publisher_name LIKE %s"
        params.append(f"%{search}%")

    query += " ORDER BY Publisher_name LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    cursor.execute(query, params)
    publishers = cursor.fetchall()

    cursor.close()
    db.close()

    return publishers

@app.put("/admin/books/{book_id}")
def admin_edit_book(book_id: int, data: BookEdit, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Fetch current stock values
    cursor.execute("SELECT Total_stock, Avail_stock FROM book WHERE Book_id = %s", (book_id,))
    book = cursor.fetchone()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    current_total = book["Total_stock"]
    current_avail = book["Avail_stock"]
    borrowed = current_total - current_avail

    # If Total_stock is being updated, validate it
    if data.Total_stock is not None:
        if data.Total_stock < borrowed:
            raise HTTPException(
                status_code=400,
                detail=f"Total stock cannot be less than borrowed copies ({borrowed})."
            )

    # Perform update
    cursor.execute("""
        UPDATE book
        SET Title = COALESCE(%s, Title),
            Publish_year = COALESCE(%s, Publish_year),
            Total_stock = COALESCE(%s, Total_stock),
            Avail_stock = COALESCE(%s, Avail_stock),
            Genre = COALESCE(%s, Genre),
            Publisher_id = COALESCE(%s, Publisher_id)
        WHERE Book_id = %s
    """, (
        data.Title,
        data.Publish_year,
        data.Total_stock,
        data.Avail_stock,
        data.Genre,
        data.Publisher_id,
        book_id
    ))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book updated successfully"}

# ADMIN: LOAN MANAGEMENT

@app.get("/admin/loans")
def admin_get_loans(access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Mark overdue loans
    cursor.execute("""
        UPDATE loan
        SET Return_status = 'overdue'
        WHERE Return_status = 'borrowed'
          AND DATE(Due_date) < CURDATE()
    """)

    # Reset overdue if date extended
    cursor.execute("""
        UPDATE loan
        SET Return_status = 'borrowed'
        WHERE Return_status = 'overdue'
          AND DATE(Due_date) >= CURDATE()
    """)

    db.commit()

    cursor.execute("""
        SELECT l.*, b.Title, m.First_name, m.Last_name
        FROM loan l
        JOIN book b ON l.Book_id = b.Book_id
        JOIN MEMBERS m ON l.Member_id = m.Member_id
        ORDER BY l.Loan_date DESC
    """)

    loans = cursor.fetchall()
    cursor.close()
    db.close()

    return loans

@app.post("/admin/loans")
def admin_create_loan(loan: LoanCreate, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Check stock
    cursor.execute("SELECT Avail_stock FROM book WHERE Book_id = %s", (loan.Book_id,))
    book = cursor.fetchone()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    if book["Avail_stock"] <= 0:
        raise HTTPException(status_code=400, detail="No available copies to loan")

    # Create loan
    cursor.execute("""
        INSERT INTO loan (Book_id, Member_id, Loan_date, Due_date, Return_date, Return_status)
            VALUES (%s, %s, %s, %s, NULL, 'borrowed')
    """, (loan.Book_id, loan.Member_id, loan.Loan_date, loan.Due_date))

    cursor.execute("UPDATE book SET Avail_stock = Avail_stock - 1 WHERE Book_id = %s", (loan.Book_id,))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Loan created successfully"}

@app.put("/admin/loans/{loan_id}/return")
def admin_return_loan(loan_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loan WHERE Loan_id = %s", (loan_id,))
    loan = cursor.fetchone()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan["Return_status"] not in ("borrowed", "overdue"):
        raise HTTPException(status_code=400, detail="This loan has already been processed")

    cursor.execute("""
        UPDATE loan
        SET Return_date = CURDATE(),
            Return_status = 'returned'
        WHERE Loan_id = %s
    """, (loan_id,))

    cursor.execute("UPDATE book SET Avail_stock = Avail_stock + 1 WHERE Book_id = %s", (loan["Book_id"],))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book returned successfully"}

@app.put("/admin/loans/{loan_id}/lost")
def admin_mark_lost(loan_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loan WHERE Loan_id = %s", (loan_id,))
    loan = cursor.fetchone()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan["Return_status"] not in ("borrowed", "overdue"):
        raise HTTPException(status_code=400, detail="Only borrowed or overdue books can be marked lost")

    cursor.execute("""
        UPDATE loan
        SET Return_status = 'lost'
        WHERE Loan_id = %s
    """, (loan_id,))

    cursor.execute("UPDATE book SET Total_stock = Total_stock - 1 WHERE Book_id = %s", (loan["Book_id"],))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book marked as lost"}

@app.delete("/admin/books/{book_id}")
def admin_delete_book(book_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT ISBN FROM book WHERE Book_id = %s", (book_id,))
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    isbn = row["ISBN"]

    cursor.execute("""
        SELECT COUNT(*) AS cnt 
        FROM loan 
        WHERE Book_id = %s AND Return_status = 'borrowed'
    """, (book_id,))
    
    if cursor.fetchone()["cnt"] > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a book with active loans"
        )

    cursor.execute("DELETE FROM book_author WHERE ISBN = %s", (isbn,))

    cursor.execute("DELETE FROM book WHERE Book_id = %s", (book_id,))
    db.commit()

    cursor.close()
    db.close()

    return {"message": "Book deleted successfully"}

# ADMIN: STATS

@app.get("/admin/stats")
def admin_stats(access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) AS total_books FROM book")
    total_books = cursor.fetchone()["total_books"]

    cursor.execute("SELECT COUNT(*) AS total_members FROM MEMBERS")
    total_members = cursor.fetchone()["total_members"]

    cursor.execute("SELECT COUNT(*) AS active_loans FROM loan WHERE Return_date IS NULL")
    active_loans = cursor.fetchone()["active_loans"]

    cursor.execute("""
        SELECT COUNT(*) AS overdue_loans
        FROM loan
        WHERE Return_date IS NULL
        AND Due_date < CURDATE()
    """)
    overdue_loans = cursor.fetchone()["overdue_loans"]

    cursor.execute("""
        SELECT COUNT(*) AS lost_or_damaged
        FROM loan
        WHERE Return_status IN ('lost', 'damaged')
    """)
    lost_or_damaged = cursor.fetchone()["lost_or_damaged"]

    cursor.close()
    db.close()

    return {
        "total_books": total_books,
        "total_members": total_members,
        "active_loans": active_loans,
        "overdue_loans": overdue_loans,
        "lost_or_damaged": lost_or_damaged
    }

# ADMIN: ANALYTICS

@app.get("/admin/analytics/loan_trend")
def admin_loan_trend(access_token: str = Cookie(None), days: int = 30):
    current = get_current_user(access_token)
    require_admin(current)

    if days <= 0 or days > 365:
        days = 30

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT DATE(Loan_date) AS date, COUNT(*) AS count
        FROM loan
        WHERE Loan_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        GROUP BY DATE(Loan_date)
        ORDER BY DATE(Loan_date) ASC
    """, (days,))

    rows = cursor.fetchall()
    cursor.close()
    db.close()

    return [
        {
            "date": (r["date"].isoformat() if hasattr(r["date"], "isoformat") else str(r["date"])),
            "count": int(r["count"]),
        }
        for r in rows
    ]


@app.get("/admin/analytics/top_books")
def admin_top_books(access_token: str = Cookie(None), limit: int = 5):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT b.Title AS name, COUNT(l.Loan_id) AS count
        FROM loan l
        JOIN book b ON b.Book_id = l.Book_id
        GROUP BY b.Book_id, b.Title
        ORDER BY count DESC
        LIMIT %s
    """, (limit,))

    rows = cursor.fetchall()
    cursor.close()
    db.close()

    return [{"name": r["name"], "count": int(r["count"])} for r in rows]


@app.get("/admin/analytics/top_members")
def admin_top_members(access_token: str = Cookie(None), limit: int = 5):
    current = get_current_user(access_token)
    require_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT CONCAT(m.First_name, ' ', m.Last_name) AS name, COUNT(l.Loan_id) AS count
        FROM loan l
        JOIN MEMBERS m ON m.Member_id = l.Member_id
        GROUP BY m.Member_id, m.First_name, m.Last_name
        ORDER BY count DESC
        LIMIT %s
    """, (limit,))

    rows = cursor.fetchall()
    cursor.close()
    db.close()

    return [{"name": r["name"], "count": int(r["count"])} for r in rows]

# LIBRARIAN: DASHBOARD STATS

@app.get("/librarian/stats")
def librarian_stats(access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        UPDATE loan
        SET Return_status = 'overdue'
        WHERE Return_status = 'borrowed'
          AND DATE(Due_date) < CURDATE()
    """)
    cursor.execute("""
        UPDATE loan
        SET Return_status = 'borrowed'
        WHERE Return_status = 'overdue'
          AND DATE(Due_date) >= CURDATE()
    """)
    db.commit()

    cursor.execute("SELECT COUNT(*) AS c FROM loan WHERE DATE(Loan_date) = CURDATE()")
    loans_today = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) AS c FROM loan WHERE DATE(Return_date) = CURDATE()")
    returns_today = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) AS c FROM loan WHERE Return_status = 'borrowed'")
    active_loans = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) AS c FROM loan WHERE Return_status = 'overdue'")
    overdue_loans = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) AS c FROM fine WHERE Paid_status = 'Unpaid'")
    unpaid_fines = cursor.fetchone()["c"]

    cursor.execute("""
        SELECT COALESCE(SUM(Fine_amount), 0) AS total
        FROM fine
        WHERE Paid_status = 'Unpaid'
    """)
    unpaid_total = float(cursor.fetchone()["total"] or 0)

    cursor.close()
    db.close()

    return {
        "loans_today": loans_today,
        "returns_today": returns_today,
        "active_loans": active_loans,
        "overdue_loans": overdue_loans,
        "unpaid_fines": unpaid_fines,
        "unpaid_total": unpaid_total,
    }

# LIBRARIAN: BOOK LOOKUP (read-only, for circulation desk)

@app.get("/librarian/books")
def librarian_get_books(
    access_token: str = Cookie(None),
    search: str | None = None,
    limit: int = 25,
):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT b.Book_id, b.ISBN, b.Title, b.Publish_year,
               b.Total_stock, b.Avail_stock, b.Genre,
               p.Publisher_name
        FROM book b
        LEFT JOIN publisher p ON b.Publisher_id = p.Publisher_id
    """
    params = []

    if search:
        query += """
            WHERE b.Title LIKE %s
               OR b.ISBN LIKE %s
               OR CAST(b.Book_id AS CHAR) = %s
        """
        like = f"%{search}%"
        params.extend([like, like, search])

    query += " ORDER BY b.Title LIMIT %s"
    params.append(limit)

    cursor.execute(query, params)
    books = cursor.fetchall()

    cursor.close()
    db.close()
    return books

# LIBRARIAN: MEMBER LOOKUP

@app.get("/librarian/members")
def librarian_get_members(
    access_token: str = Cookie(None),
    search: str | None = None,
    limit: int = 25,
):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT Member_id, First_name, Last_name, Email, Phone_number,
               Join_date, Member_role
        FROM MEMBERS
    """
    params = []

    if search:
        query += """
            WHERE CAST(Member_id AS CHAR) = %s
               OR First_name LIKE %s
               OR Last_name LIKE %s
               OR Email LIKE %s
        """
        like = f"%{search}%"
        params.extend([search, like, like, like])

    query += " ORDER BY Last_name, First_name LIMIT %s"
    params.append(limit)

    cursor.execute(query, params)
    members = cursor.fetchall()

    cursor.close()
    db.close()
    return members


@app.get("/librarian/members/{member_id}/summary")
def librarian_member_summary(member_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    update_fines_for_member(member_id)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT Member_id, First_name, Last_name, Email, Phone_number, Address,
               Join_date, Member_role
        FROM MEMBERS WHERE Member_id = %s
    """, (member_id,))
    member = cursor.fetchone()

    if not member:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Member not found")

    cursor.execute("""
        SELECT
            l.Loan_id, l.Book_id, b.Title, l.Loan_date, l.Due_date,
            l.Return_date, l.Return_status
        FROM loan l
        JOIN book b ON l.Book_id = b.Book_id
        WHERE l.Member_id = %s
        ORDER BY l.Loan_date DESC
    """, (member_id,))
    loans = cursor.fetchall()

    cursor.execute("""
        SELECT f.Fine_id, f.Loan_id, f.Fine_amount, f.Payment_date,
               f.Paid_status, b.Title
        FROM fine f
        JOIN loan l ON f.Loan_id = l.Loan_id
        JOIN book b ON l.Book_id = b.Book_id
        WHERE l.Member_id = %s
        ORDER BY f.Paid_status DESC, f.Fine_id DESC
    """, (member_id,))
    fines = cursor.fetchall()

    cursor.execute("""
        SELECT COALESCE(SUM(Fine_amount), 0) AS total
        FROM fine f
        JOIN loan l ON f.Loan_id = l.Loan_id
        WHERE l.Member_id = %s AND f.Paid_status = 'Unpaid'
    """, (member_id,))
    unpaid_total = float(cursor.fetchone()["total"] or 0)

    cursor.close()
    db.close()

    return {
        "member": member,
        "loans": loans,
        "fines": fines,
        "unpaid_total": unpaid_total,
    }

# LIBRARIAN: LOAN MANAGEMENT (circulation desk)

@app.get("/librarian/loans")
def librarian_get_loans(
    access_token: str = Cookie(None),
    status: str | None = None,
    search: str | None = None,
    limit: int = 100,
):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        UPDATE loan
        SET Return_status = 'overdue'
        WHERE Return_status = 'borrowed'
          AND DATE(Due_date) < CURDATE()
    """)
    cursor.execute("""
        UPDATE loan
        SET Return_status = 'borrowed'
        WHERE Return_status = 'overdue'
          AND DATE(Due_date) >= CURDATE()
    """)
    db.commit()

    query = """
        SELECT l.*, b.Title, m.First_name, m.Last_name
        FROM loan l
        JOIN book b ON l.Book_id = b.Book_id
        JOIN MEMBERS m ON l.Member_id = m.Member_id
        WHERE 1=1
    """
    params = []

    if status and status != "all":
        query += " AND l.Return_status = %s"
        params.append(status)

    if search:
        query += """
            AND (
                b.Title LIKE %s
                OR m.First_name LIKE %s
                OR m.Last_name LIKE %s
                OR CAST(l.Member_id AS CHAR) = %s
                OR CAST(l.Loan_id AS CHAR) = %s
            )
        """
        like = f"%{search}%"
        params.extend([like, like, like, search, search])

    query += " ORDER BY l.Loan_date DESC LIMIT %s"
    params.append(limit)

    cursor.execute(query, params)
    loans = cursor.fetchall()

    cursor.close()
    db.close()

    return loans


@app.post("/librarian/loans")
def librarian_create_loan(loan: LoanCreate, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT Avail_stock FROM book WHERE Book_id = %s", (loan.Book_id,))
    book = cursor.fetchone()

    if not book:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Book not found")

    if book["Avail_stock"] <= 0:
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="No available copies to loan")

    cursor.execute("SELECT Member_id FROM MEMBERS WHERE Member_id = %s", (loan.Member_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Member not found")

    cursor.execute("""
        INSERT INTO loan (Book_id, Member_id, Loan_date, Due_date, Return_date, Return_status)
            VALUES (%s, %s, %s, %s, NULL, 'borrowed')
    """, (loan.Book_id, loan.Member_id, loan.Loan_date, loan.Due_date))

    cursor.execute("UPDATE book SET Avail_stock = Avail_stock - 1 WHERE Book_id = %s", (loan.Book_id,))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Loan created successfully"}


@app.put("/librarian/loans/{loan_id}/return")
def librarian_return_loan(loan_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loan WHERE Loan_id = %s", (loan_id,))
    loan = cursor.fetchone()

    if not loan:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan["Return_status"] not in ("borrowed", "overdue"):
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="This loan has already been processed")

    cursor.execute("""
        UPDATE loan
        SET Return_date = CURDATE(),
            Return_status = 'returned'
        WHERE Loan_id = %s
    """, (loan_id,))

    cursor.execute(
        "UPDATE book SET Avail_stock = Avail_stock + 1 WHERE Book_id = %s",
        (loan["Book_id"],),
    )

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book returned successfully"}


@app.put("/librarian/loans/{loan_id}/lost")
def librarian_mark_lost(loan_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loan WHERE Loan_id = %s", (loan_id,))
    loan = cursor.fetchone()

    if not loan:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan["Return_status"] not in ("borrowed", "overdue"):
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Only borrowed or overdue books can be marked lost")

    cursor.execute("""
        UPDATE loan
        SET Return_status = 'lost'
        WHERE Loan_id = %s
    """, (loan_id,))

    cursor.execute(
        "UPDATE book SET Total_stock = Total_stock - 1 WHERE Book_id = %s",
        (loan["Book_id"],),
    )

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Book marked as lost"}


@app.put("/librarian/loans/{loan_id}/renew")
def librarian_renew_loan(
    loan_id: int,
    days: int = 14,
    access_token: str = Cookie(None),
):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    if days <= 0 or days > 60:
        raise HTTPException(status_code=400, detail="Renewal must be between 1 and 60 days")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM loan WHERE Loan_id = %s", (loan_id,))
    loan = cursor.fetchone()

    if not loan:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Loan not found")

    if loan["Return_status"] not in ("borrowed", "overdue"):
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Only active loans can be renewed")

    cursor.execute("""
        UPDATE loan
        SET Due_date = DATE_ADD(Due_date, INTERVAL %s DAY),
            Return_status = CASE
                WHEN DATE_ADD(Due_date, INTERVAL %s DAY) >= CURDATE() THEN 'borrowed'
                ELSE Return_status
            END
        WHERE Loan_id = %s
    """, (days, days, loan_id))

    db.commit()
    cursor.close()
    db.close()

    return {"message": f"Loan renewed by {days} days"}

# LIBRARIAN: FINES (collection desk)

@app.get("/librarian/fines")
def librarian_get_fines(
    access_token: str = Cookie(None),
    paid: str | None = None,
    search: str | None = None,
    limit: int = 100,
):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT
            f.Fine_id, f.Loan_id, f.Fine_amount, f.Payment_date, f.Paid_status,
            l.Member_id, l.Book_id, l.Loan_date, l.Due_date, l.Return_date,
            l.Return_status,
            b.Title,
            m.First_name, m.Last_name
        FROM fine f
        JOIN loan l ON f.Loan_id = l.Loan_id
        JOIN book b ON l.Book_id = b.Book_id
        JOIN MEMBERS m ON l.Member_id = m.Member_id
        WHERE 1=1
    """
    params = []

    if paid == "unpaid":
        query += " AND f.Paid_status = 'Unpaid'"
    elif paid == "paid":
        query += " AND f.Paid_status = 'Paid'"

    if search:
        query += """
            AND (
                b.Title LIKE %s
                OR m.First_name LIKE %s
                OR m.Last_name LIKE %s
                OR CAST(l.Member_id AS CHAR) = %s
            )
        """
        like = f"%{search}%"
        params.extend([like, like, like, search])

    query += " ORDER BY f.Paid_status ASC, f.Fine_id DESC LIMIT %s"
    params.append(limit)

    cursor.execute(query, params)
    fines = cursor.fetchall()

    cursor.close()
    db.close()

    return fines


@app.put("/librarian/fines/{fine_id}/pay")
def librarian_pay_fine(fine_id: int, access_token: str = Cookie(None)):
    current = get_current_user(access_token)
    require_librarian_or_admin(current)

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM fine WHERE Fine_id = %s", (fine_id,))
    fine = cursor.fetchone()

    if not fine:
        cursor.close()
        db.close()
        raise HTTPException(status_code=404, detail="Fine not found")

    if fine["Paid_status"] == "Paid":
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Fine already paid")

    cursor.execute("""
        UPDATE fine
        SET Paid_status = 'Paid',
            Payment_date = CURDATE()
        WHERE Fine_id = %s
    """, (fine_id,))

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Fine marked as paid"}
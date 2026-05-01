"""
Book Recommendation Router

logic flowchart:
  1. Member Input: Start with a Member_id for personalized recs
  2. Loan History: Fetch all books that this member has loaned before
  3. Extract Signals: Pull genre, author, and publisher from those books
  4. Score & Rank: Score unread books by matching signals (genre > author > publisher)
  5. Filter & Return: Exclude already-loaned books, check avail_stock > 0
  6. Top Results: Return top 5 ranked recommendations
"""

from fastapi import APIRouter, Cookie, HTTPException
from typing import Optional

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def get_db():
    import mysql.connector
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="newpassword",
        database="LIBRARY",
        auth_plugin="mysql_native_password",
    )


def get_current_user(access_token: str | None):
    """Mirrors the auth helper in main.py."""
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    from jose import jwt
    SECRET_KEY = "super-secret-key"
    ALGORITHM = "HS256"

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


@router.get("/{member_id}")
def get_recommendations(member_id: int, access_token: str = Cookie(None)):
    """
    Generate personalized book recommendations for a given member.

    Scoring weights (genre > author > publisher):
      - Genre match:    +3 points
      - Author match:   +2 points
      - Publisher match: +1 point

    Filters:
      - Exclude books the member has already loaned
      - Only include books with avail_stock > 0

    Returns:
      Top 5 book recommendations ranked by score (descending)
    """
    current = get_current_user(access_token)

    # Only the member themselves or an admin/librarian can request recommendations
    if current["Member_id"] != member_id and current["Member_role"] not in ("admin", "librarian"):
        raise HTTPException(status_code=403, detail="Not allowed")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    #  Step 1 & 2: Fetch all books the member has loaned before 
    cursor.execute(
        """
        SELECT b.Book_id, b.ISBN, b.Title, b.Genre, b.Publisher_id,
               p.Publisher_name
        FROM loan l
        JOIN book b ON l.Book_id = b.Book_id
        LEFT JOIN publisher p ON b.Publisher_id = p.Publisher_id
        WHERE l.Member_id = %s
        """,
        (member_id,),
    )
    loaned_books = cursor.fetchall()

    # If the member has no loan history, return empty recommendations
    if not loaned_books:
        cursor.close()
        db.close()
        return []

    #  Step 3: Extract signals — genre, author, publisher
    # Genres the member reads
    genre_set = set()
    for book in loaned_books:
        if book["Genre"]:
            genre_set.add(book["Genre"])

    # Authors the member reads (via ISBN from loaned books)
    isbn_list = [book["ISBN"] for book in loaned_books]
    author_set = set()
    if isbn_list:
        placeholders = ",".join(["%s"] * len(isbn_list))
        cursor.execute(
            f"""
            SELECT DISTINCT ba.Author_id
            FROM book_author ba
            WHERE ba.ISBN IN ({placeholders})
            """,
            isbn_list,
        )
        for row in cursor.fetchall():
            author_set.add(row["Author_id"])

    # Publishers the member reads
    publisher_set = set()
    for book in loaned_books:
        if book["Publisher_id"]:
            publisher_set.add(book["Publisher_id"])

    #  Collect set of already-loaned Book_ids for exclusion 
    loaned_book_ids = set(book["Book_id"] for book in loaned_books)

    #  Step 4: Score unread books by matching signals 
    # Fetch all candidate books that are NOT already loaned
    cursor.execute(
        """
        SELECT b.Book_id, b.ISBN, b.Title, b.Publish_year,
               b.Total_stock, b.Avail_stock, b.Genre,
               b.Publisher_id,
               p.Publisher_name
        FROM book b
        LEFT JOIN publisher p ON b.Publisher_id = p.Publisher_id
        """
    )
    all_books = cursor.fetchall()

    # For author matching, pre-fetch all book_author mappings for candidate books
    candidate_isbns = [
        b["ISBN"] for b in all_books if b["Book_id"] not in loaned_book_ids
    ]

    # Build a map: ISBN -> set of Author_ids for quick lookup
    isbn_to_authors = {}
    if candidate_isbns:
        # Fetch in batches to avoid huge IN clauses
        batch_size = 200
        for i in range(0, len(candidate_isbns), batch_size):
            batch = candidate_isbns[i : i + batch_size]
            placeholders = ",".join(["%s"] * len(batch))
            cursor.execute(
                f"""
                SELECT ISBN, Author_id
                FROM book_author
                WHERE ISBN IN ({placeholders})
                """,
                batch,
            )
            for row in cursor.fetchall():
                isbn_to_authors.setdefault(row["ISBN"], set()).add(row["Author_id"])

    # Also fetch author names for the response
    all_author_ids = set()
    for authors in isbn_to_authors.values():
        all_author_ids.update(authors)
    all_author_ids.update(author_set)

    author_id_to_name = {}
    if all_author_ids:
        aid_list = list(all_author_ids)
        placeholders = ",".join(["%s"] * len(aid_list))
        cursor.execute(
            f"""
            SELECT Author_id, CONCAT(First_name, ' ', Last_name) AS Author_name
            FROM author
            WHERE Author_id IN ({placeholders})
            """,
            aid_list,
        )
        for row in cursor.fetchall():
            author_id_to_name[row["Author_id"]] = row["Author_name"]

    #  Step 5: Filter & Score 
    scored_books = []

    for book in all_books:
        # Exclude already-loaned books
        if book["Book_id"] in loaned_book_ids:
            continue

        # Check avail_stock > 0
        if book["Avail_stock"] <= 0:
            continue

        score = 0

        # Genre match (highest weight: +3)
        if book["Genre"] and book["Genre"] in genre_set:
            score += 3

        # Author match (medium weight: +2)
        book_author_ids = isbn_to_authors.get(book["ISBN"], set())
        if book_author_ids & author_set:
            score += 2

        # Publisher match (lowest weight: +1)
        if book["Publisher_id"] and book["Publisher_id"] in publisher_set:
            score += 1

        # Only include books with at least one signal match
        if score > 0:
            # Get author names for this book
            book_author_names = ", ".join(
                sorted(
                    author_id_to_name.get(aid, "Unknown")
                    for aid in book_author_ids
                )
            )

            scored_books.append({
                "Book_id": book["Book_id"],
                "ISBN": book["ISBN"],
                "Title": book["Title"],
                "Publish_year": book["Publish_year"],
                "Total_stock": book["Total_stock"],
                "Avail_stock": book["Avail_stock"],
                "Genre": book["Genre"],
                "Publisher_name": book["Publisher_name"],
                "authors": book_author_names,
                "score": score,
            })

    #  Step 6: Return top 5 ranked recommendations 
    scored_books.sort(key=lambda x: x["score"], reverse=True)
    top_5 = scored_books[:5]

    cursor.close()
    db.close()

    return top_5
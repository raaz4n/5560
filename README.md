# MetaBooks: A Library Management System

A relational database management system (RDBMS) designed to track library assets, member records, and borrowing activities. This project uses SQL to handle complex relationships between books, authors, publishers, and loans.

## Project Structure

* **`Library DB.sql`**: Contains the Data Definition Language (DDL) to create the `LIBRARY` database and its relational tables.
* **`some_queries.sql`**: Contains sample Data Manipulation Language (DML) for inserting records and administrative queries.

## Database Schema

The database is built on a relational model with the following tables:

| Table | Primary Key | Description |
| :--- | :--- | :--- |
| **`PUBLISHER`** | `Publisher_id` | Stores publishing house names and countries. |
| **`AUTHOR`** | `Author_id` | Stores author names. |
| **`BOOK`** | `Book_id` | Catalog of books including ISBN, stock levels, and genre. |
| **`MEMBERS`** | `Member_id` | Registered patrons with contact details and hashed passwords. |
| **`LOAN`** | `Loan_id` | Records of borrowed books, due dates, and return status. |
| **`FINE`** | `Fine_id` | Financial penalties associated with specific loans. |
| **`BOOK_AUTHOR`** | `(Book_id, Author_id)` | Junction table mapping books to their respective authors. |


## Getting Started
### 1. Instalization
Run the Library DB.sql script first to create the table structures.
### 2. Populating Data
Use the some_queries.sql file to insert sample records for:
* Publishers: (e.g., Bloomsbury, Tor Books).
* Authors: (e.g., Neil Gaiman, Marie Lu).
* Books: (e.g., Coraline, Ender's Game).
### 3. Common Operations
The provided query script includes examples for:
* Member Management: Adding and deleting member records.
* Data Analysis: Filtering books by publication year and calculating total stock grouped by genre.
* Administrative Tracking: Identifying overdue books by comparing Due_date against a reference date.


## Example Query: Stock by Genre

To see which genres are most prevalent in the library, the system uses the following logic:

```sql
SELECT Genre, SUM(Total_stock) AS Total_Books
FROM BOOK
GROUP BY Genre
ORDER BY Total_Books DESC;



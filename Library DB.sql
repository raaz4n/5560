#CREATE DATABASE LIBRARY;
USE LIBRARY;

CREATE TABLE PUBLISHER
(
	Publisher_id INT NOT NULL UNIQUE,
    Publisher_name VARCHAR(50) NOT NULL,
    Country VARCHAR(30),
    PRIMARY KEY(Publisher_id)
);

CREATE TABLE AUTHOR
(
	Author_id INT NOT NULL UNIQUE,
    First_name VARCHAR(30) NOT NULL,
    Last_name VARCHAR(30) NOT NULL,
    PRIMARY KEY(Author_id)
);

CREATE TABLE BOOK
(
	Book_id INT NOT NULL UNIQUE,
    ISBN VARCHAR(13) NOT NULL UNIQUE,
    Title VARCHAR(100) NOT NULL,
    Publisher_id INT,
    Publish_year INT,
    Total_stock INT NOT NULL,
    Avail_stock INT NOT NULL,
    Genre VARCHAR(20),
    Label_num INT,
    PRIMARY KEY(Book_id),
    FOREIGN KEY(Publisher_id) REFERENCES PUBLISHER(Publisher_id)
);

CREATE TABLE MEMBERS
(
	Member_id INT NOT NULL UNIQUE,
    First_name VARCHAR(30) NOT NULL,
    Last_name VARCHAR(30) NOT NULL,
    Address VARCHAR(50),
    Phone_number VARCHAR(20),
    Email VARCHAR(50) NOT NULL,
    Join_date DATE,
    PRIMARY KEY(Member_id)
);

CREATE TABLE LOAN
(
	Loan_id INT NOT NULL UNIQUE,
    Book_id INT NOT NULL,
    Member_id INT NOT NULL,
    Loan_date DATE NOT NULL,
    Due_date DATE NOT NULL,
    Return_date DATE,
    Return_status VARCHAR(15) NOT NULL,
    PRIMARY KEY(Loan_id),
    FOREIGN KEY(Book_id) REFERENCES BOOK(Book_id),
    FOREIGN KEY(Member_id) REFERENCES MEMBERS(Member_id)
);

CREATE TABLE FINE
(
	Fine_id INT NOT NULL UNIQUE,
    Loan_id INT NOT NULL,
    Fine_amount DECIMAL(10, 2) NOT NULL,
    Payment_date DATE,
    Paid_status VARCHAR(15),
    PRIMARY KEY(Fine_id),
    FOREIGN KEY(Loan_id) REFERENCES LOAN(Loan_id)
);

CREATE TABLE BOOK_AUTHOR
(
	Book_id INT NOT NULL,
    Author_id INT NOT NULL,
    PRIMARY KEY(Book_id, Author_id),
    FOREIGN KEY(Book_id) REFERENCES BOOK(Book_id),
    FOREIGN KEY(Author_id) REFERENCES AUTHOR(Author_id)
);

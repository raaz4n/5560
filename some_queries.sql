-- Add Member
INSERT INTO MEMBERS (Member_id, First_name, Last_name, Address, Phone_number, Email, Join_date)
VALUES (1001, 'Jane', 'Doe', '123 Library Lane', '123-4567', 'jane.doe@email.com', '2026-02-11');

-- Delete Memeber
DELETE FROM MEMBERS 
WHERE Member_id = 1001;

-- Add Publishers
INSERT INTO PUBLISHER (Publisher_id, Publisher_name, Country) VALUES 
(10, 'G.P. Putnams Sons', 'USA'),
(11, 'Bloomsbury', 'UK'),
(12, 'Crown Publishers', 'USA'),
(13, 'Tor Books', 'USA'),
(14, 'Frederick A. Stokes', 'USA');

-- Add Authors
INSERT INTO AUTHOR (Author_id, First_name, Last_name) VALUES 
(20, 'Marie', 'Lu'),
(21, 'Neil', 'Gaiman'),
(22, 'Erik', 'Larson'),
(23, 'Seanan', 'McGuire'),
(24, 'Orson Scott', 'Card'),
(25, 'Frances Hodgson', 'Burnett');

-- Add books
INSERT INTO BOOK (Book_id, ISBN, Title, Publisher_id, Publish_year, Total_stock, Avail_stock, Genre) VALUES 
(101, '9780399157271', 'Legend', 10, 2011, 5, 5, 'Dystopian'),
(102, '9780380977789', 'Coraline', 11, 2002, 3, 3, 'Fantasy'),
(103, '9780609608449', 'The Devil in the White City', 12, 2003, 4, 4, 'Non-Fiction'),
(104, '9780765385505', 'Every Heart a Doorway', 13, 2016, 6, 6, 'Fantasy'),
(105, '9780312932084', 'Enders Game', 13, 1985, 8, 8, 'Sci-Fi'),
(106, '9780064401883', 'The Secret Garden', 14, 1911, 10, 10, 'Classic');

-- Books published before 2000
SELECT Title, Publish_year, Genre 
FROM BOOK 
WHERE Publish_year < 2000;

-- Overdue books
SELECT Member_id, Book_id, Due_date
FROM LOAN
WHERE Return_date IS NULL 
  AND Due_date < '2026-02-11'; 
  
-- Stock by genre  
SELECT Genre, SUM(Total_stock) AS Total_Books
FROM BOOK
GROUP BY Genre
ORDER BY Total_Books DESC;
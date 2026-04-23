// Database Integration Guide for Search Page
// This file explains how to connect the Search page to your MySQL database

/**
 * OVERVIEW
 * ========
 * The Search.tsx page currently uses mock data that matches your library schema.
 * To integrate with your real database, you'll need to:
 * 1. Create API endpoints that query your MySQL database
 * 2. Replace the mock data with API calls
 * 3. Handle loading and error states
 */

/**
 * DATABASE QUERY EXAMPLES
 * =======================
 * Here are the SQL queries you'll need to implement on your backend:
 */

// 1. Get all books with their authors and publishers (for initial load)
const GET_ALL_BOOKS_QUERY = `
  SELECT 
    b.Book_id,
    b.ISBN,
    b.Title,
    b.Publisher_id,
    b.Publish_year,
    b.Total_stock,
    b.Avail_stock,
    b.Genre,
    b.Label_num,
    p.Publisher_name,
    p.Country,
    GROUP_CONCAT(CONCAT(a.First_name, ' ', a.Last_name) SEPARATOR ', ') as Authors
  FROM BOOK b
  LEFT JOIN PUBLISHER p ON b.Publisher_id = p.Publisher_id
  LEFT JOIN BOOK_AUTHOR ba ON b.ISBN = ba.ISBN
  LEFT JOIN AUTHOR a ON ba.Author_id = a.Author_id
  GROUP BY b.Book_id
`;

// 2. Search books by keyword (searches title, author, publisher, ISBN)
const SEARCH_BOOKS_QUERY = `
  SELECT 
    b.Book_id,
    b.ISBN,
    b.Title,
    b.Publisher_id,
    b.Publish_year,
    b.Total_stock,
    b.Avail_stock,
    b.Genre,
    b.Label_num,
    p.Publisher_name,
    p.Country,
    GROUP_CONCAT(CONCAT(a.First_name, ' ', a.Last_name) SEPARATOR ', ') as Authors
  FROM BOOK b
  LEFT JOIN PUBLISHER p ON b.Publisher_id = p.Publisher_id
  LEFT JOIN BOOK_AUTHOR ba ON b.ISBN = ba.ISBN
  LEFT JOIN AUTHOR a ON ba.Author_id = a.Author_id
  WHERE 
    b.Title LIKE CONCAT('%', ?, '%')
    OR b.ISBN LIKE CONCAT('%', ?, '%')
    OR p.Publisher_name LIKE CONCAT('%', ?, '%')
    OR a.First_name LIKE CONCAT('%', ?, '%')
    OR a.Last_name LIKE CONCAT('%', ?, '%')
  GROUP BY b.Book_id
`;

// 3. Filter by genre
const FILTER_BY_GENRE_QUERY = `
  SELECT * FROM BOOK WHERE Genre = ?
`;

// 4. Filter by availability
const FILTER_BY_AVAILABILITY_QUERY = `
  SELECT * FROM BOOK WHERE Avail_stock > 0
`;

/**
 * FRONTEND API INTEGRATION
 * =========================
 * Replace the mockBooks array in Search.tsx with API calls
 */

// Example using fetch:
const fetchBooks = async (searchQuery = "", genreFilter = "all", availabilityFilter = "all") => {
  const params = new URLSearchParams({
    search: searchQuery,
    genre: genreFilter,
    availability: availabilityFilter,
  });
  
  const response = await fetch(`/api/books?${params}`);
  const data = await response.json();
  return data;
};

// Or using a library like axios:
import axios from 'axios';

const fetchBooks = async (searchQuery = "", genreFilter = "all", availabilityFilter = "all") => {
  const { data } = await axios.get('/api/books', {
    params: {
      search: searchQuery,
      genre: genreFilter,
      availability: availabilityFilter,
    }
  });
  return data;
};

/**
 * BACKEND API ENDPOINT EXAMPLE (Node.js/Express with MySQL)
 * ==========================================================
 */

// Example backend endpoint (put this in your backend server code)
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'LIBRARY',
  waitForConnections: true,
  connectionLimit: 10,
});

// GET /api/books - Search and filter books
router.get('/api/books', async (req, res) => {
  try {
    const { search = '', genre = 'all', availability = 'all' } = req.query;
    
    let query = `
      SELECT 
        b.Book_id,
        b.ISBN,
        b.Title,
        b.Publisher_id,
        b.Publish_year,
        b.Total_stock,
        b.Avail_stock,
        b.Genre,
        b.Label_num,
        p.Publisher_id,
        p.Publisher_name,
        p.Country,
        a.Author_id,
        a.First_name,
        a.Last_name
      FROM BOOK b
      LEFT JOIN PUBLISHER p ON b.Publisher_id = p.Publisher_id
      LEFT JOIN BOOK_AUTHOR ba ON b.ISBN = ba.ISBN
      LEFT JOIN AUTHOR a ON ba.Author_id = a.Author_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add search filter
    if (search) {
      query += ` AND (
        b.Title LIKE ? OR 
        b.ISBN LIKE ? OR 
        p.Publisher_name LIKE ? OR 
        a.First_name LIKE ? OR 
        a.Last_name LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }
    
    // Add genre filter
    if (genre !== 'all') {
      query += ' AND b.Genre = ?';
      params.push(genre);
    }
    
    // Add availability filter
    if (availability === 'available') {
      query += ' AND b.Avail_stock > 0';
    } else if (availability === 'unavailable') {
      query += ' AND b.Avail_stock = 0';
    }
    
    const [rows] = await pool.execute(query, params);
    
    // Transform the flat result into the nested structure expected by frontend
    const booksMap = new Map();
    
    rows.forEach(row => {
      if (!booksMap.has(row.Book_id)) {
        booksMap.set(row.Book_id, {
          Book_id: row.Book_id,
          ISBN: row.ISBN,
          Title: row.Title,
          Publisher_id: row.Publisher_id,
          Publish_year: row.Publish_year,
          Total_stock: row.Total_stock,
          Avail_stock: row.Avail_stock,
          Genre: row.Genre,
          Label_num: row.Label_num,
          publisher: {
            Publisher_id: row.Publisher_id,
            Publisher_name: row.Publisher_name,
            Country: row.Country,
          },
          authors: [],
        });
      }
      
      // Add author if exists and not already added
      const book = booksMap.get(row.Book_id);
      if (row.Author_id && !book.authors.find(a => a.Author_id === row.Author_id)) {
        book.authors.push({
          Author_id: row.Author_id,
          First_name: row.First_name,
          Last_name: row.Last_name,
        });
      }
    });
    
    const books = Array.from(booksMap.values());
    res.json(books);
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

/**
 * UPDATING SEARCH.TSX TO USE API
 * ==============================
 */

// Replace the mockBooks array and add these changes to Search.tsx:

import { useState, useMemo, useEffect } from "react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchQuery,
          genre: genreFilter,
          availability: availabilityFilter,
        });
        
        const response = await fetch(`/api/books?${params}`);
        if (!response.ok) throw new Error('Failed to fetch books');
        
        const data = await response.json();
        setBooks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, genreFilter, availabilityFilter]);

  // Show loading state
  if (loading) {
    return <div>Loading books...</div>;
  }

  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Now use 'books' instead of 'mockBooks' for filtering
  // ... rest of the component
}

/**
 * PRODUCTION CONSIDERATIONS
 * ==========================
 * 
 * 1. Add debouncing to search input to avoid excessive API calls
 * 2. Implement pagination for large result sets
 * 3. Add proper error handling and user feedback
 * 4. Consider caching frequently accessed data
 * 5. Add loading skeletons for better UX
 * 6. Secure your API endpoints with authentication
 * 7. Add rate limiting to prevent abuse
 * 8. Validate and sanitize all user inputs
 * 9. Use environment variables for sensitive data
 * 10. Add proper CORS configuration if frontend and backend are on different domains
 */

export {};

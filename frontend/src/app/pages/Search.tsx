import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, BookOpen } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router";

interface Book {
  Book_id: number;
  ISBN: string;
  Title: string;
  Publish_year: number;
  Total_stock: number;
  Avail_stock: number;
  Genre: string;
  Publisher_name: string;
  authors: string;
}

export default function Search() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Detect login status
  useEffect(() => {
    fetch("http://localhost:8000/me", { credentials: "include" })
      .then(async (res) => {
        if (res.status !== 200) {
          setIsLoggedIn(false);
          return;
        }

        const data = await res.json();

        // If backend returns an error object, treat as logged out
        if (data?.detail) {
          setIsLoggedIn(false);
          return;
        }

        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);


  // Fetch genres once on mount
  useEffect(() => {
    fetch("http://localhost:8000/genres")
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error("Failed to fetch genres:", err));
  }, []);

  // Fetch books whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (genreFilter !== "all") params.append("genre", genreFilter);
    if (availabilityFilter !== "all") params.append("availability", availabilityFilter);

    fetch(`http://localhost:8000/books?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Failed to fetch books:", err))
      .finally(() => setLoading(false));
  }, [searchQuery, genreFilter, availabilityFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Header with background image */}
      <div
        className="relative bg-cover bg-center py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1643050079091-1d4a51e07ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl text-white mb-6 text-center">
              Search Our Catalog
            </h1>
            <p className="text-lg text-white/90 mb-8 text-center">
              Browse through our extensive collection of books
            </p>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by title, author, ISBN, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg">Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Genre</label>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Availability</label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Books" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Books</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="unavailable">Currently Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setGenreFilter("all");
                    setAvailabilityFilter("all");
                  }}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-gray-600">
              {loading
                ? "Loading..."
                : `Found ${books.length} ${books.length === 1 ? "book" : "books"}`}
            </p>
          </div>

          {/* Books Grid */}
          {!loading && books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <Card key={book.Book_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {/* Book cover image */}
                    <div className="w-full h-40 mb-2 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://covers.openlibrary.org/b/isbn/${book.ISBN}-M.jpg`}
                        alt={book.Title}
                        className="h-full object-contain"
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.naturalWidth <= 1) {
                            img.style.display = "none";
                            img.parentElement!.innerHTML = `
                              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;width:100%;background:#f3f4f6;border-radius:6px;color:#9ca3af;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                                <span style="font-size:11px;margin-top:6px;font-weight:600;letter-spacing:0.05em;">NO COVER</span>
                              </div>
                            `;
                          }
                        }}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          img.parentElement!.innerHTML = `
                            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:160px;width:100%;background:#f3f4f6;border-radius:6px;color:#9ca3af;">
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                              <span style="font-size:11px;margin-top:6px;font-weight:600;letter-spacing:0.05em;">NO COVER</span>
                            </div>
                          `;
                        }}
                      />
                    </div>

                    <div className="flex items-start gap-3 mb-2">
                      <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <CardTitle className="text-base leading-tight">
                        {book.Title}
                      </CardTitle>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{book.Genre}</Badge>
                      {book.Avail_stock > 0 ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Author(s): </span>
                        <span>{book.authors || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Publisher: </span>
                        <span>{book.Publisher_name || "Unknown"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Year: </span>
                        <span>{book.Publish_year || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">ISBN: </span>
                        <span className="font-mono text-xs">{book.ISBN}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-gray-500">Stock: </span>
                        <span className={book.Avail_stock > 0 ? "text-green-600" : "text-red-600"}>
                          {book.Avail_stock} / {book.Total_stock} available
                        </span>
                      </div>
                    </div>

                    {/* Reserve Button */}
                    <Button
                    className="w-full mt-4"
                    disabled={book.Avail_stock === 0}
                    onClick={() => {
                        if (book.Avail_stock === 0) return;

                        if (!isLoggedIn) {
                          navigate("/signin");
                          return;
                        }

                        navigate(`/reserve/${book.Book_id}`);
                      }}
                    >
                      {book.Avail_stock > 0 ? "Reserve Book" : "Out of Stock"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
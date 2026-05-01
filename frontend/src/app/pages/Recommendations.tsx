import { useState, useEffect } from "react";
import { Sparkles, BookOpen, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import NavBar from "../components/NavBarWithRecs";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router";

interface RecommendedBook {
  Book_id: number;
  ISBN: string;
  Title: string;
  Publish_year: number;
  Total_stock: number;
  Avail_stock: number;
  Genre: string;
  Publisher_name: string;
  authors: string;
  score: number;
}

export default function Recommendations() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<RecommendedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        if (data?.detail) {
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Fetch recommendations
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/recommendations/${user.Member_id}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: "Failed to fetch recommendations" }));
          throw new Error(errData.detail || "Failed to fetch recommendations");
        }
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [user, authLoading]);

  // Score label helper
  function getScoreLabel(score: number): { label: string; color: string } {
    if (score >= 5) return { label: "Perfect Match", color: "bg-emerald-100 text-emerald-800" };
    if (score >= 4) return { label: "Great Match", color: "bg-green-100 text-green-800" };
    if (score >= 3) return { label: "Good Match", color: "bg-blue-100 text-blue-800" };
    if (score >= 2) return { label: "Fair Match", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Similar", color: "bg-gray-100 text-gray-700" };
  }

  function getMatchReasons(book: RecommendedBook): string[] {
    const reasons: string[] = [];
    if (book.score >= 3) reasons.push("Matching genre");
    if (book.score === 2 || book.score >= 5) reasons.push("Favorite author");
    if (book.score === 1 || book.score >= 4) reasons.push("Preferred publisher");
    // Deduplicate while preserving order
    return [...new Set(reasons)];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Header */}
      <div
        className="relative bg-cover bg-center py-16"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(https://images.unsplash.com/photo-1507842217343-583bb7270b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl text-white font-bold">Personalized For You</h1>
            </div>
            <p className="text-lg text-white/90 mb-2">
              Book recommendations based on your reading history
            </p>
            <p className="text-sm text-white/70">
              We analyze the genres, authors, and publishers you love to find your next great read
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Not logged in state */}
          {!authLoading && !user && (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">Sign in to get recommendations</h3>
              <p className="text-gray-500 mb-6">
                We use your loan history to suggest books you'll love
              </p>
              <Button onClick={() => navigate("/signin")} className="bg-black hover:bg-gray-800">
                Sign In
              </Button>
            </div>
          )}

          {/* Loading state */}
          {loading && user && (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl text-gray-600 mb-2">Finding your next reads...</h3>
              <p className="text-gray-500">
                Analyzing your reading history for the best matches
              </p>
            </div>
          )}

          {/* Error state */}
          {error && user && (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">Something went wrong</h3>
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {/* Empty state — no loan history */}
          {!loading && !error && user && books.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-600 mb-2">No recommendations yet</h3>
              <p className="text-gray-500 mb-6">
                Borrow some books first, and we'll recommend similar titles you'll enjoy!
              </p>
              <Button onClick={() => navigate("/search")} variant="outline">
                Browse the Catalog
              </Button>
            </div>
          )}

          {/* Recommendations grid */}
          {!loading && !error && books.length > 0 && (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Based on your reading history, here are your <span className="font-semibold">top {books.length}</span> picks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {books.map((book, index) => {
                  const scoreInfo = getScoreLabel(book.score);
                  const reasons = getMatchReasons(book);

                  return (
                    <Card key={book.Book_id} className="hover:shadow-lg transition-shadow relative overflow-hidden">
                      {/* Rank badge */}
                      <div className="absolute top-3 left-3 z-10 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>

                      <CardHeader className="pb-3">
                        {/* Book cover */}
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

                        <div className="flex items-start gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <CardTitle className="text-sm leading-tight">
                            {book.Title}
                          </CardTitle>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-xs">{book.Genre}</Badge>
                          <Badge className={`text-xs ${scoreInfo.color}`}>{scoreInfo.label}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-1.5 text-xs">
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
                          <div className="pt-1.5 border-t">
                            <span className="text-gray-500">Stock: </span>
                            <span className={book.Avail_stock > 0 ? "text-green-600" : "text-red-600"}>
                              {book.Avail_stock} / {book.Total_stock} available
                            </span>
                          </div>

                          {/* Match reasons */}
                          {reasons.length > 0 && (
                            <div className="pt-1.5 border-t">
                              <span className="text-gray-500">Matched by: </span>
                              <span className="text-blue-600 font-medium">
                                {reasons.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Reserve Button */}
                        <Button
                          className="w-full mt-3 text-sm"
                          disabled={book.Avail_stock === 0}
                          onClick={async () => {
                            if (book.Avail_stock === 0) return;
                            if (!isLoggedIn) {
                              navigate("/signin");
                              return;
                            }
                            const res = await fetch("http://localhost:8000/reservations", {
                              method: "POST",
                              credentials: "include",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ Book_id: book.Book_id }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              alert(data.detail || "Failed to reserve");
                              return;
                            }
                            const expires = new Date(data.Expires_at).toLocaleString();
                            alert(
                              `Reserved! Pickup code: #${data.Reservation_id}\n` +
                              `Show this at the circulation desk by ${expires}.\n` +
                              `(After that the copy returns to the shelf.)`
                            );
                            // Optimistically reflect the stock decrement
                            setBooks((prev) =>
                              prev.map((b) =>
                                b.Book_id === book.Book_id
                                  ? { ...b, Avail_stock: Math.max(0, b.Avail_stock - 1) }
                                  : b
                              )
                            );
                          }}
                        >
                          {book.Avail_stock > 0 ? "Reserve Book" : "Out of Stock"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* How it works section */}
              <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  How Recommendations Work
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Your Reading History</p>
                      <p className="text-xs text-gray-500">
                        We look at the books you've borrowed to understand your taste
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Signal Extraction</p>
                      <p className="text-xs text-gray-500">
                        We pull out the genres, authors, and publishers you prefer
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Smart Scoring</p>
                      <p className="text-xs text-gray-500">
                        Books are scored by genre (3 pts), author (2 pts), and publisher (1 pt), then ranked
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
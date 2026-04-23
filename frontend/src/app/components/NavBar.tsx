import { useNavigate } from "react-router";
import { Home, Search, LogIn, UserPlus, LayoutDashboard, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "./AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const auth = useAuth();

  if (!auth || auth.loading) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-16 flex items-center px-4">
        <span className="text-xl font-semibold">MetaBooks</span>
      </nav>
    );
  }

  const { user, setUser } = auth;

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    }

    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl hover:opacity-70 transition-opacity cursor-pointer"
          >
            MetaBooks
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            {/* LIBRARIAN + ADMIN */}
            {(user?.Member_role === "librarian" || user?.Member_role === "admin") && (
              <button
                onClick={() => navigate("/librarian")}
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Librarian</span>
              </button>
            )}

            {/* ADMIN ONLY */}
            {user?.Member_role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}

            {/* AUTH BUTTONS */}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/signin")}
                  className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

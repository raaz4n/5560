import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Users,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../components/AuthContext";

interface LibrarianStats {
  loans_today: number;
  returns_today: number;
  active_loans: number;
  overdue_loans: number;
  unpaid_fines: number;
  unpaid_total: number;
}

export default function LibrarianDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth() ?? { user: null };

  const [stats, setStats] = useState<LibrarianStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/librarian/stats", {
        credentials: "include",
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Failed to load librarian stats", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const cards = [
    {
      title: "Circulation Desk",
      subtitle: "Check out books, process returns, and renew loans",
      icon: BookOpen,
      path: "/librarian/circulation",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Member Lookup",
      subtitle: "Find members and view their loan and fine history",
      icon: Users,
      path: "/librarian/members",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Fines Desk",
      subtitle: "Collect payments on outstanding fines",
      icon: DollarSign,
      path: "/librarian/fines",
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Overdue Loans",
      subtitle: "Follow up on loans past their due date",
      icon: AlertTriangle,
      path: "/librarian/circulation?status=overdue",
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Back to Home
        </button>

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl">Librarian Dashboard</h1>
            {user && (
              <p className="text-gray-600 mt-2">
                Signed in as {user.First_name} {user.Last_name} ·{" "}
                <span className="capitalize">{user.Member_role}</span>
              </p>
            )}
          </div>

          <button
            onClick={loadStats}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Today's activity */}
        <div className="mb-10">
          <h2 className="text-xl text-gray-700 mb-4">Today at a glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatBox label="Checkouts today" value={stats?.loans_today ?? 0} loading={loading} />
            <StatBox label="Returns today" value={stats?.returns_today ?? 0} loading={loading} />
            <StatBox label="Active loans" value={stats?.active_loans ?? 0} loading={loading} />
            <StatBox
              label="Overdue"
              value={stats?.overdue_loans ?? 0}
              loading={loading}
              color={(stats?.overdue_loans ?? 0) > 0 ? "text-red-600" : "text-black"}
            />
            <StatBox label="Unpaid fines" value={stats?.unpaid_fines ?? 0} loading={loading} />
            <StatBox
              label="Owed"
              value={
                loading
                  ? "…"
                  : `$${(stats?.unpaid_total ?? 0).toFixed(2)}`
              }
              loading={false}
              color="text-amber-700"
            />
          </div>
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200 text-left"
              >
                <div className="flex items-start gap-6">
                  <div className={`${card.color} rounded-lg p-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl mb-2">{card.title}</h2>
                    <p className="text-gray-600">{card.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  loading,
  color = "text-black",
}: {
  label: string;
  value: number | string;
  loading: boolean;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${color}`}>
        {loading ? "…" : value}
      </p>
    </div>
  );
}

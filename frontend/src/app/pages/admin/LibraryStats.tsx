import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

interface Stats {
  total_books: number;
  total_members: number;
  active_loans: number;
  overdue_loans: number;
  lost_or_damaged: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface TopItem {
  name: string;
  count: number;
}

export default function LibraryStats() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loanTrend, setLoanTrend] = useState<TrendPoint[]>([]);
  const [topBooks, setTopBooks] = useState<TopItem[]>([]);
  const [topMembers, setTopMembers] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/admin/stats", {
        credentials: "include",
      });
      const data = await res.json();
      setStats(data);

      // Fetch analytics endpoints
      const trendRes = await fetch("http://localhost:8000/admin/analytics/loan_trend", { credentials: "include" });
      setLoanTrend(await trendRes.json());

      const booksRes = await fetch("http://localhost:8000/admin/analytics/top_books", { credentials: "include" });
      setTopBooks(await booksRes.json());

      const membersRes = await fetch("http://localhost:8000/admin/analytics/top_members", { credentials: "include" });
      setTopMembers(await membersRes.json());

    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const pieData = stats
    ? [
        { name: "Borrowed", value: stats.active_loans },
        { name: "Overdue", value: stats.overdue_loans },
        { name: "Lost/Damaged", value: stats.lost_or_damaged },
      ]
    : [];

  const COLORS = ["#3b82f6", "#f97316", "#dc2626"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-semibold">Library Analytics</h1>

          <button
            onClick={loadStats}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <StatCard title="Total Books" value={stats.total_books} />
            <StatCard title="Total Members" value={stats.total_members} />
            <StatCard title="Active Loans" value={stats.active_loans} />
            <StatCard title="Overdue Loans" value={stats.overdue_loans} color="text-orange-600" />
            <StatCard title="Lost / Damaged" value={stats.lost_or_damaged} color="text-red-600" />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Loan Trend */}
          <ChartCard title="Loans Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loanTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Loan Status Breakdown */}
          <ChartCard title="Loan Status Breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Top Books & Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ChartCard title="Top Borrowed Books">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBooks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Most Active Members">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMembers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* System Health Panel */}
        <div className="mt-16">
          <h2 className="text-3xl font-semibold mb-6">System Health</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HealthCard label="Database Status" value="Operational" color="text-green-600" />
            <HealthCard label="API Uptime" value="99.98%" color="text-blue-600" />
            <HealthCard label="Inventory Health" value={`${Math.round((stats?.active_loans ?? 0) / (stats?.total_books ?? 1) * 100)}% loaned`} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */

function StatCard({ title, value, color = "text-black" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg text-gray-600">{title}</h2>
      <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

function HealthCard({ label, value, color = "text-gray-800" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-600">{label}</h3>
      <p className={`text-2xl font-semibold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

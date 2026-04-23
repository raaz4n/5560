import { useNavigate } from "react-router";
import { Users, Book, ClipboardList, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: "Manage Users",
      subtitle: "View, edit, and manage member accounts",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Manage Books",
      subtitle: "Add, edit, or remove books from the catalog",
      icon: Book,
      path: "/admin/books",
    },
    {
      title: "Manage Loans",
      subtitle: "Track active, overdue, and returned loans",
      icon: ClipboardList,
      path: "/admin/loans",
    },
    {
      title: "Library Stats",
      subtitle: "View system metrics and activity summaries",
      icon: BarChart3,
      path: "/admin/stats",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/")}
        className="mb-8 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition"
      >← Back to Home</button>
        <h1 className="text-4xl mb-12">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
          {dashboardCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200 text-left"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <Icon className="w-8 h-8 text-blue-600" />
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, DollarSign } from "lucide-react";

interface FineRow {
  Fine_id: number;
  Loan_id: number;
  Fine_amount: number;
  Payment_date: string | null;
  Paid_status: "Paid" | "Unpaid";
  Member_id: number;
  Book_id: number;
  Loan_date: string;
  Due_date: string;
  Return_date: string | null;
  Return_status: string;
  Title: string;
  First_name: string;
  Last_name: string;
}

export default function FinesDesk() {
  const navigate = useNavigate();

  const [fines, setFines] = useState<FineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unpaid" | "paid" | "all">("unpaid");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadFines() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("paid", filter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(
        `http://localhost:8000/librarian/fines?${params}`,
        { credentials: "include" }
      );
      if (res.ok) setFines(await res.json());
    } catch (err) {
      console.error("Failed to load fines", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFines();
  }, [filter, searchQuery]);

  async function payFine(fineId: number) {
    if (!confirm("Mark this fine as paid?")) return;
    const res = await fetch(
      `http://localhost:8000/librarian/fines/${fineId}/pay`,
      { method: "PUT", credentials: "include" }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Action failed" }));
      alert(err.detail);
      return;
    }
    loadFines();
  }

  const totals = useMemo(() => {
    const unpaid = fines
      .filter((f) => f.Paid_status === "Unpaid")
      .reduce((sum, f) => sum + Number(f.Fine_amount), 0);
    const paid = fines
      .filter((f) => f.Paid_status === "Paid")
      .reduce((sum, f) => sum + Number(f.Fine_amount), 0);
    return { unpaid, paid, count: fines.length };
  }, [fines]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigate("/librarian")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl mb-8">Fines Desk</h1>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Showing</p>
            <p className="text-2xl font-semibold">{totals.count} fines</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Unpaid total</p>
            <p className="text-2xl font-semibold text-amber-700">
              ${totals.unpaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600">Paid total (in view)</p>
            <p className="text-2xl font-semibold text-emerald-700">
              ${totals.paid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by member or title..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["unpaid", "paid", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                  filter === f
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Fines table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading fines…</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Fine #</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Member</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Book</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No fines match these filters
                    </td>
                  </tr>
                ) : (
                  fines.map((f) => (
                    <tr key={f.Fine_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{f.Fine_id}</td>
                      <td className="px-4 py-3">
                        {f.First_name} {f.Last_name}{" "}
                        <span className="text-xs text-gray-500">#{f.Member_id}</span>
                      </td>
                      <td className="px-4 py-3">{f.Title}</td>
                      <td className="px-4 py-3 text-gray-600">{f.Due_date}</td>
                      <td className="px-4 py-3 font-medium">
                        ${Number(f.Fine_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {f.Paid_status === "Paid" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            Paid {f.Payment_date ? `· ${f.Payment_date}` : ""}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {f.Paid_status === "Unpaid" && (
                          <button
                            onClick={() => payFine(f.Fine_id)}
                            className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

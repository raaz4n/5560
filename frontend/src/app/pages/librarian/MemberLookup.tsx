import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Mail, Phone, MapPin } from "lucide-react";

interface MemberRow {
  Member_id: number;
  First_name: string;
  Last_name: string;
  Email: string;
  Phone_number: string | null;
  Join_date: string;
  Member_role: string;
}

interface LoanRow {
  Loan_id: number;
  Book_id: number;
  Title: string;
  Loan_date: string;
  Due_date: string;
  Return_date: string | null;
  Return_status: string;
}

interface FineRow {
  Fine_id: number;
  Loan_id: number;
  Fine_amount: number;
  Payment_date: string | null;
  Paid_status: "Paid" | "Unpaid";
  Title: string;
}

interface Summary {
  member: MemberRow & { Address: string | null };
  loans: LoanRow[];
  fines: FineRow[];
  unpaid_total: number;
}

export default function MemberLookup() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<MemberRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery) {
        setResults([]);
        return;
      }
      const res = await fetch(
        `http://localhost:8000/librarian/members?search=${encodeURIComponent(searchQuery)}&limit=20`,
        { credentials: "include" }
      );
      if (res.ok) setResults(await res.json());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadSummary(memberId: number) {
    setSelectedId(memberId);
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/librarian/members/${memberId}/summary`,
        { credentials: "include" }
      );
      if (res.ok) setSummary(await res.json());
      else setSummary(null);
    } finally {
      setLoading(false);
    }
  }

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

        <h1 className="text-4xl mb-8">Member Lookup</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search + results */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, or member ID..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <ul className="divide-y divide-gray-200 max-h-[600px] overflow-auto">
              {results.length === 0 ? (
                <li className="py-6 text-center text-gray-500 text-sm">
                  {searchQuery ? "No matches" : "Start typing to search"}
                </li>
              ) : (
                results.map((m) => (
                  <li
                    key={m.Member_id}
                    onClick={() => loadSummary(m.Member_id)}
                    className={`py-3 px-2 cursor-pointer rounded-lg hover:bg-gray-50 ${
                      selectedId === m.Member_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="font-medium">
                      {m.First_name} {m.Last_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      #{m.Member_id} · {m.Email}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 capitalize">
                      {m.Member_role}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 space-y-6">
            {!summary && !loading && (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500 border border-gray-200">
                Select a member to view their loans and fines.
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500 border border-gray-200">
                Loading…
              </div>
            )}

            {summary && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl">
                        {summary.member.First_name} {summary.member.Last_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Member #{summary.member.Member_id} · Joined{" "}
                        {summary.member.Join_date}
                      </p>
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {summary.member.Member_role}
                      </span>
                    </div>
                    {summary.unpaid_total > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-amber-700 uppercase tracking-wide">
                          Unpaid balance
                        </div>
                        <div className="text-2xl font-semibold text-amber-700">
                          ${summary.unpaid_total.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-sm">
                    <InfoRow icon={<Mail className="w-4 h-4" />} value={summary.member.Email} />
                    <InfoRow
                      icon={<Phone className="w-4 h-4" />}
                      value={summary.member.Phone_number || "—"}
                    />
                    <InfoRow
                      icon={<MapPin className="w-4 h-4" />}
                      value={summary.member.Address || "—"}
                    />
                  </div>
                </div>

                {/* Loans */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg">Loans ({summary.loans.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left">Loan #</th>
                          <th className="px-4 py-2 text-left">Book</th>
                          <th className="px-4 py-2 text-left">Loaned</th>
                          <th className="px-4 py-2 text-left">Due</th>
                          <th className="px-4 py-2 text-left">Returned</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {summary.loans.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                              No loans on file
                            </td>
                          </tr>
                        ) : (
                          summary.loans.map((l) => (
                            <tr key={l.Loan_id}>
                              <td className="px-4 py-2">{l.Loan_id}</td>
                              <td className="px-4 py-2">{l.Title}</td>
                              <td className="px-4 py-2 text-gray-600">{l.Loan_date}</td>
                              <td className="px-4 py-2 text-gray-600">{l.Due_date}</td>
                              <td className="px-4 py-2 text-gray-600">
                                {l.Return_date ?? "—"}
                              </td>
                              <td className="px-4 py-2 capitalize">{l.Return_status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fines */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg">Fines ({summary.fines.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left">Fine #</th>
                          <th className="px-4 py-2 text-left">Book</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Paid on</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {summary.fines.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                              No fines
                            </td>
                          </tr>
                        ) : (
                          summary.fines.map((f) => (
                            <tr key={f.Fine_id}>
                              <td className="px-4 py-2">{f.Fine_id}</td>
                              <td className="px-4 py-2">{f.Title}</td>
                              <td className="px-4 py-2">${Number(f.Fine_amount).toFixed(2)}</td>
                              <td className="px-4 py-2">
                                {f.Paid_status === "Paid" ? (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                    Unpaid
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {f.Payment_date ?? "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <span className="text-gray-400">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

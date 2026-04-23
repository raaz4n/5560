import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Search,
  Check,
  XCircle,
  RotateCw,
  BookPlus,
} from "lucide-react";

type LoanStatus = "borrowed" | "returned" | "lost" | "overdue";

interface Loan {
  Loan_id: number;
  Book_id: number;
  Member_id: number;
  Loan_date: string;
  Due_date: string;
  Return_date: string | null;
  Return_status: LoanStatus;
  Title: string;
  First_name: string;
  Last_name: string;
}

interface BookHit {
  Book_id: number;
  ISBN: string;
  Title: string;
  Avail_stock: number;
  Total_stock: number;
}

interface MemberHit {
  Member_id: number;
  First_name: string;
  Last_name: string;
  Email: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function CirculationDesk() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = (searchParams.get("status") as LoanStatus | "all" | null) ?? "all";

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>(statusParam);

  // Checkout form state
  const [bookQuery, setBookQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [bookHits, setBookHits] = useState<BookHit[]>([]);
  const [memberHits, setMemberHits] = useState<MemberHit[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookHit | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberHit | null>(null);
  const [loanDate, setLoanDate] = useState(today());
  const [dueDate, setDueDate] = useState(inDays(14));
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  async function loadLoans() {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(
        `http://localhost:8000/librarian/loans?${params}`,
        { credentials: "include" }
      );
      if (res.ok) {
        setLoans(await res.json());
      }
    } catch (err) {
      console.error("Failed to load loans", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
    const next = new URLSearchParams(searchParams);
    if (statusFilter === "all") next.delete("status");
    else next.set("status", statusFilter);
    setSearchParams(next, { replace: true });
  }, [statusFilter, searchQuery]);

  // Book typeahead
  useEffect(() => {
    if (!bookQuery) {
      setBookHits([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `http://localhost:8000/librarian/books?search=${encodeURIComponent(bookQuery)}&limit=8`,
        { credentials: "include" }
      );
      if (res.ok) setBookHits(await res.json());
    }, 250);
    return () => clearTimeout(timer);
  }, [bookQuery]);

  // Member typeahead
  useEffect(() => {
    if (!memberQuery) {
      setMemberHits([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `http://localhost:8000/librarian/members?search=${encodeURIComponent(memberQuery)}&limit=8`,
        { credentials: "include" }
      );
      if (res.ok) setMemberHits(await res.json());
    }, 250);
    return () => clearTimeout(timer);
  }, [memberQuery]);

  async function checkoutBook() {
    if (!selectedBook || !selectedMember) {
      setCheckoutMsg("Select a book and a member first.");
      return;
    }

    const res = await fetch("http://localhost:8000/librarian/loans", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Book_id: selectedBook.Book_id,
        Member_id: selectedMember.Member_id,
        Loan_date: loanDate,
        Due_date: dueDate,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Checkout failed" }));
      setCheckoutMsg(err.detail ?? "Checkout failed");
      return;
    }

    setCheckoutMsg(
      `Checked out "${selectedBook.Title}" to ${selectedMember.First_name} ${selectedMember.Last_name}. Due ${dueDate}.`
    );
    setSelectedBook(null);
    setSelectedMember(null);
    setBookQuery("");
    setMemberQuery("");
    setLoanDate(today());
    setDueDate(inDays(14));
    loadLoans();
  }

  async function returnLoan(loanId: number) {
    const res = await fetch(
      `http://localhost:8000/librarian/loans/${loanId}/return`,
      { method: "PUT", credentials: "include" }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Return failed" }));
      alert(err.detail);
      return;
    }
    loadLoans();
  }

  async function renewLoan(loanId: number) {
    const res = await fetch(
      `http://localhost:8000/librarian/loans/${loanId}/renew?days=14`,
      { method: "PUT", credentials: "include" }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Renewal failed" }));
      alert(err.detail);
      return;
    }
    loadLoans();
  }

  async function markLost(loanId: number) {
    if (!confirm("Mark this loan as lost? This decrements total stock.")) return;
    const res = await fetch(
      `http://localhost:8000/librarian/loans/${loanId}/lost`,
      { method: "PUT", credentials: "include" }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Action failed" }));
      alert(err.detail);
      return;
    }
    loadLoans();
  }

  const counts = useMemo(() => {
    return {
      borrowed: loans.filter((l) => l.Return_status === "borrowed").length,
      overdue: loans.filter((l) => l.Return_status === "overdue").length,
    };
  }, [loans]);

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

        <h1 className="text-4xl mb-8">Circulation Desk</h1>

        {/* CHECKOUT PANEL */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BookPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl">New Checkout</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Book picker */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Book (title / ISBN / ID)</label>
              {selectedBook ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div>
                    <div className="font-medium">{selectedBook.Title}</div>
                    <div className="text-sm text-gray-600">
                      ISBN {selectedBook.ISBN} · {selectedBook.Avail_stock}/{selectedBook.Total_stock} available
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    value={bookQuery}
                    onChange={(e) => setBookQuery(e.target.value)}
                    placeholder="Search catalog..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {bookHits.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-md max-h-60 overflow-auto">
                      {bookHits.map((b) => (
                        <li
                          key={b.Book_id}
                          onClick={() => {
                            setSelectedBook(b);
                            setBookHits([]);
                            setBookQuery("");
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{b.Title}</div>
                          <div className="text-xs text-gray-500">
                            ISBN {b.ISBN} · {b.Avail_stock}/{b.Total_stock} available
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Member picker */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Member (name / email / ID)</label>
              {selectedMember ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-emerald-50">
                  <div>
                    <div className="font-medium">
                      {selectedMember.First_name} {selectedMember.Last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      #{selectedMember.Member_id} · {selectedMember.Email}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {memberHits.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-md max-h-60 overflow-auto">
                      {memberHits.map((m) => (
                        <li
                          key={m.Member_id}
                          onClick={() => {
                            setSelectedMember(m);
                            setMemberHits([]);
                            setMemberQuery("");
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">
                            {m.First_name} {m.Last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{m.Member_id} · {m.Email}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Loan date</label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm">
              {checkoutMsg && (
                <span
                  className={
                    checkoutMsg.startsWith("Checked out")
                      ? "text-emerald-700"
                      : "text-red-600"
                  }
                >
                  {checkoutMsg}
                </span>
              )}
            </div>
            <button
              onClick={checkoutBook}
              disabled={!selectedBook || !selectedMember}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Check Out
            </button>
          </div>
        </div>

        {/* LOANS TABLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, member, or loan ID..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "borrowed", "overdue", "returned", "lost"] as const).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    statusFilter === s
                      ? "bg-black text-white border-black"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {statusFilter === "all" && (
          <div className="text-sm text-gray-600 mb-3">
            Showing {loans.length} loans · Borrowed: {counts.borrowed} · Overdue: {counts.overdue}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading loans…</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Loan #</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Book</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Member</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Loan Date</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Due</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No loans match these filters
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.Loan_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{loan.Loan_id}</td>
                      <td className="px-4 py-3">{loan.Title}</td>
                      <td className="px-4 py-3">
                        {loan.First_name} {loan.Last_name}{" "}
                        <span className="text-xs text-gray-500">#{loan.Member_id}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{loan.Loan_date}</td>
                      <td className="px-4 py-3 text-gray-600">{loan.Due_date}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={loan.Return_status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {(loan.Return_status === "borrowed" ||
                            loan.Return_status === "overdue") && (
                            <>
                              <button
                                onClick={() => returnLoan(loan.Loan_id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="Return book"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => renewLoan(loan.Loan_id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="Renew 14 days"
                              >
                                <RotateCw className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => markLost(loan.Loan_id)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                                title="Mark lost"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
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

function StatusBadge({ status }: { status: LoanStatus }) {
  const s = (status || "").toLowerCase();
  if (s === "borrowed")
    return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Borrowed</span>;
  if (s === "returned")
    return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Returned</span>;
  if (s === "lost")
    return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Lost</span>;
  if (s === "overdue")
    return <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Overdue</span>;
  return <span className="text-xs text-gray-500">{status}</span>;
}

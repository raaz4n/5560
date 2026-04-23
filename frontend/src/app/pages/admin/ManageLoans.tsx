import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Check, XCircle, Search } from "lucide-react";
import { useNavigate } from "react-router";

interface Loan {
  Loan_id: number;
  Book_id: number;
  Member_id: number;
  Loan_date: string;
  Due_date: string;
  Return_date: string | null;
  Return_status: "borrowed" | "returned" | "lost" | "overdue";
  Title: string;
  First_name: string;
  Last_name: string;
}

export default function ManageLoans() {
  const navigate = useNavigate();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Create loan form
  const [newBookId, setNewBookId] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [newLoanDate, setNewLoanDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  async function loadLoans() {
    try {
      const res = await fetch("http://localhost:8000/admin/loans", {
        credentials: "include",
      });

      const data = await res.json();

      // Simple search filter
      const filtered = data.filter((loan: Loan) =>
        `${loan.Title} ${loan.First_name} ${loan.Last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

      setLoans(filtered);
    } catch (err) {
      console.error("Failed to load loans", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, [searchQuery]);

  // Create loan
  async function createLoan() {
    const res = await fetch("http://localhost:8000/admin/loans", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Book_id: Number(newBookId),
        Member_id: Number(newMemberId),
        Loan_date: newLoanDate,
        Due_date: newDueDate,
      }),
    });

    if (res.status === 400) {
      const err = await res.json();
      alert(err.detail);
      return;
    }

    setAddModalOpen(false);
    loadLoans();
  }

  // Return loan
  async function returnLoan(loanId: number) {
    const res = await fetch(`http://localhost:8000/admin/loans/${loanId}/return`, {
      method: "PUT",
      credentials: "include",
    });

    if (res.status === 400) {
      const err = await res.json();
      alert(err.detail);
      return;
    }

    loadLoans();
  }

  // Mark lost
  async function markLost(loanId: number) {
    const res = await fetch(`http://localhost:8000/admin/loans/${loanId}/lost`, {
      method: "PUT",
      credentials: "include",
    });

    if (res.status === 400) {
      const err = await res.json();
      alert(err.detail);
      return;
    }

    loadLoans();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl">Loan Management</h1>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Loan
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by book title or member name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Loan ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Book</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Member</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Loan Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No loans found
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.Loan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{loan.Loan_id}</td>
                    <td className="px-6 py-4">{loan.Title}</td>
                    <td className="px-6 py-4">
                      {loan.First_name} {loan.Last_name}
                    </td>
                    <td className="px-6 py-4">{loan.Loan_date}</td>
                    <td className="px-6 py-4">{loan.Due_date}</td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      {loan.Return_status === "borrowed" && (
                        <span className="text-blue-600">Borrowed</span>
                      )}
                      {loan.Return_status === "returned" && (
                        <span className="text-green-600">Returned</span>
                      )}
                      {loan.Return_status === "lost" && (
                        <span className="text-red-600">Lost</span>
                      )}
                      {(loan.Return_status === "overdue" || loan.Return_status === "Overdue") && (
                        <span className="text-orange-600 font-semibold">Past Overdue</span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* CREATE LOAN MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full">
            <h2 className="text-2xl mb-6">Create Loan</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Book ID</label>
                <input
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Member ID</label>
                <input
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Loan Date</label>
                <input
                  type="date"
                  value={newLoanDate}
                  onChange={(e) => setNewLoanDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setAddModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={createLoan}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
              >
                Create Loan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

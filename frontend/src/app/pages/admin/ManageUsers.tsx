import { useState, useEffect } from "react";
import { ArrowLeft, Search, Edit, Trash2, UserCog } from "lucide-react";
import { useNavigate } from "react-router";

type UserRole = "regular" | "librarian" | "admin";

interface User {
  Member_id: number;
  First_name: string;
  Last_name: string;
  Email: string;
  Phone_number: string | null;
  Address: string | null;
  Join_date: string;
  Member_role: UserRole;
}

export default function ManageUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const [page, setPage] = useState(0); // page index (0 = first page)
  const limit = 50;
  
  async function loadUsers() {
  try {
    const params = new URLSearchParams({
      search: searchQuery,
      limit: limit.toString(),
      offset: (page * limit).toString()
    });

    const res = await fetch(`http://localhost:8000/admin/users?${params}`, {
      credentials: "include",
    });

    const data = await res.json();
    setUsers(data);
  } catch (err) {
    console.error("Failed to load users", err);
  } finally {
    setLoading(false);
  }
}
    // Load on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load when search changes
  useEffect(() => {
  loadUsers();
}, [page, searchQuery]);

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.First_name} ${user.Last_name}`.toLowerCase();
    const matchesSearch =
    user.Member_id.toString().includes(searchQuery) ||
    fullName.includes(searchQuery.toLowerCase()) ||
    user.Email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.Member_role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-black text-white";
      case "librarian":
        return "bg-blue-100 text-blue-800";
      case "regular":
        return "bg-gray-100 text-gray-800";
    }
  };

  // Save user changes
  async function saveUserChanges() {
    if (!selectedUser) return;

    await fetch(`http://localhost:8000/admin/users/${selectedUser.Member_id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: editFirst,
      lastName: editLast,
      phone: editPhone,
      address: editAddress,
    }),
  });

    // Refresh list
    const res = await fetch("http://localhost:8000/admin/users", {
      credentials: "include",
    });
    const data = await res.json();
    setUsers(data);

    setEditModalOpen(false);
  }

  async function updateUserRole() {
    if (!selectedUser) return;

    await fetch(`http://localhost:8000/admin/users/${selectedUser.Member_id}/role`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_role: selectedUser.Member_role }),
    });

    // Refresh users
    const res = await fetch("http://localhost:8000/admin/users", {
      credentials: "include",
    });
    const data = await res.json();
    setUsers(data);

    setRoleModalOpen(false);
  }

  async function deleteUser() {
    if (!selectedUser) return;

    try {
      await fetch(`http://localhost:8000/admin/users/${selectedUser.Member_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      // Refresh the list
      await loadUsers();

      // Close modal
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
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

        <h1 className="text-4xl mb-8">User Management</h1>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email or member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as typeof roleFilter)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="regular">Regular</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-gray-500">Loading users…</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Member ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.Member_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{user.Member_id}</td>

                      <td className="px-6 py-4">
                        {user.First_name} {user.Last_name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.Email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(
                            user.Member_role
                          )}`}
                        >
                          {user.Member_role.charAt(0).toUpperCase() +
                            user.Member_role.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.Join_date}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditFirst(user.First_name);
                              setEditLast(user.Last_name);
                              setEditPhone(user.Phone_number || "");
                              setEditAddress(user.Address || "");
                              setEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <UserCog className="w-4 h-4 text-gray-600" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded-lg border ${
            page === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Previous
        </button>

        <button
          disabled={users.length < limit}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 rounded-lg border ${
            users.length < limit ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl mb-6">Edit User</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFirst}
                  onChange={(e) => setEditFirst(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editLast}
                  onChange={(e) => setEditLast(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={saveUserChanges}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {roleModalOpen && selectedUser && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full">
          <h2 className="text-2xl mb-6">Change User Role</h2>
          <p className="text-gray-600 mb-4">
            Select a new role for {selectedUser.First_name} {selectedUser.Last_name}
          </p>

          <div className="space-y-3 mb-6">
            {["regular", "librarian", "admin"].map((role) => (
              <label
                key={role}
                className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  defaultChecked={selectedUser.Member_role === role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, Member_role: e.target.value as UserRole })}
                />
                <div>
                  <div className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                  <div className="text-sm text-gray-600">
                    {role === "regular" && "Standard member access"}
                    {role === "librarian" && "Can manage books and loans"}
                    {role === "admin" && "Full system access"}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setRoleModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={updateUserRole}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Update Role
            </button>
          </div>
        </div>
      </div>
    )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl mb-4">Delete User</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>{selectedUser.First_name} {selectedUser.Last_name}</strong>?  
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={selectedUser.Member_role === "admin"}
                onClick={deleteUser}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  selectedUser.Member_role === "admin"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

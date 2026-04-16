import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router";

interface Book {
  Book_id: number;
  ISBN: string;
  Title: string;
  Publish_year: number;
  Total_stock: number;
  Avail_stock: number;
  Genre: string;
  Publisher_name: string | null;
}

export default function ManageBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Add form state
  const [newTitle, setNewTitle] = useState("");
  const [newISBN, setNewISBN] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newPublisher, setNewPublisher] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newTotalStock, setNewTotalStock] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editISBN, setEditISBN] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editPublisher, setEditPublisher] = useState("");
  const [editTotalStock, setEditTotalStock] = useState("");
  const [editAvailStock, setEditAvailStock] = useState("");

  const [publishers, setPublishers] = useState<{ Publisher_id: number; Publisher_name: string }[]>([]);
  const [editPublisherId, setEditPublisherId] = useState<number | null>(null);
  const [newPublisherId, setNewPublisherId] = useState<number | null>(null);
  const [publisherPage, setPublisherPage] = useState(0);
  const publisherLimit = 20;


  // Load publishers for dropdowns
  async function loadPublishers(reset = false) {
    const params = new URLSearchParams({
      limit: publisherLimit.toString(),
      offset: (publisherPage * publisherLimit).toString(),
    });

    const res = await fetch(`http://localhost:8000/admin/publishers?${params}`, {
      credentials: "include",
    });

    const data = await res.json();

    setPublishers((prev) => reset ? data : [...prev, ...data]);
  }


  useEffect(() => {
    loadPublishers(true);
  }, []);



  // Load books
  async function loadBooks() {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      const res = await fetch(`http://localhost:8000/admin/books?${params}`, {
        credentials: "include",
      });

      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [page, searchQuery]);

  // Add Book
  async function addBook() {
    await fetch("http://localhost:8000/admin/books-add", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ISBN: newISBN,
        Title: newTitle,
        Publish_year: Number(newYear),
        Total_stock: Number(newTotalStock),
        Avail_stock: Number(newTotalStock),
        Genre: newGenre,
        Publisher_id: newPublisherId // You can replace this with a real publisher selector
      }),
    });

    setAddModalOpen(false);
    loadBooks();
  }

  // Edit Book
  async function saveBookChanges() {
    if (!selectedBook) return;

    if (Number(editTotalStock) < selectedBook.Avail_stock) {
      alert(`Total stock cannot be less than available stock (${selectedBook.Avail_stock}).`);
      return;
    }

    await fetch(`http://localhost:8000/admin/books/${selectedBook.Book_id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Title: editTitle,
        Publish_year: selectedBook.Publish_year,
        Total_stock: Number(editTotalStock),
        Avail_stock: null,
        Genre: editGenre,
        Publisher_id: editPublisherId,
      }),
    });


    setEditModalOpen(false);
    loadBooks();
  }

  // Delete Book
  async function deleteBook() {
    if (!selectedBook) return;

    await fetch(`http://localhost:8000/admin/books/${selectedBook.Book_id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setDeleteModalOpen(false);
    loadBooks();
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
          <h1 className="text-4xl">Book Management</h1>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, ISBN, genre, publisher..."
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
                <th className="px-6 py-4 text-left text-sm text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Title</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">ISBN</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Genre</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Publisher</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Stock</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No books found
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.Book_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{book.Book_id}</td>
                    <td className="px-6 py-4">{book.Title}</td>
                    <td className="px-6 py-4">{book.ISBN}</td>
                    <td className="px-6 py-4">{book.Genre}</td>
                    <td className="px-6 py-4">{book.Publisher_name}</td>
                    <td className="px-6 py-4">
                      {book.Avail_stock} / {book.Total_stock}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setEditTitle(book.Title);
                            setEditISBN(book.ISBN);
                            setEditGenre(book.Genre);
                            setEditPublisher(book.Publisher_name || "");
                            setEditTotalStock(book.Total_stock.toString());
                            setEditModalOpen(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
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
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={books.length < limit}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD BOOK MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl mb-6">Add New Book</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">ISBN</label>
                <input
                  value={newISBN}
                  onChange={(e) => setNewISBN(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Genre</label>
                <input
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                  <label className="text-sm text-gray-600">Publisher</label>
                  <select
                    value={newPublisherId ?? ""}
                    onChange={(e) => setNewPublisherId(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select publisher</option>
                    {publishers.map((p) => (
                      <option key={p.Publisher_id} value={p.Publisher_id}>
                        {p.Publisher_name}
                      </option>
                    ))}
                  </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Publication Year</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Total Stock</label>
                <input
                  type="number"
                  value={newTotalStock}
                  onChange={(e) => setNewTotalStock(e.target.value)}
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
                onClick={addBook}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BOOK MODAL */}
      {editModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl mb-6">Edit Book</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">ISBN</label>
                <input
                  value={editISBN}
                  onChange={(e) => setEditISBN(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Genre</label>
                <input
                  value={editGenre}
                  onChange={(e) => setEditGenre(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Publisher</label>

                <div className="border rounded-lg">
                  <select
                    value={newPublisherId ?? ""}
                    onChange={(e) => setNewPublisherId(Number(e.target.value))}
                    className="w-full px-4 py-2"
                  >
                    <option value="">Select publisher</option>

                    {publishers.map((p) => (
                      <option key={p.Publisher_id} value={p.Publisher_id}>
                        {p.Publisher_name}
                      </option>
                    ))}
                  </select>

                  {/* Load more button */}
                  {publishers.length === (publisherPage + 1) * publisherLimit && (
                    <button
                      onClick={() => {
                        setPublisherPage((prev) => prev + 1);
                        loadPublishers();
                      }}
                      className="w-full py-2 text-blue-600 hover:bg-gray-100"
                    >
                      Load more…
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Total Stock</label>
                <input
                  type="number"
                  value={editTotalStock}
                  onChange={(e) => setEditTotalStock(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={saveBookChanges}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BOOK MODAL */}
      {deleteModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl mb-4">Delete Book</h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedBook.Title}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={deleteBook}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

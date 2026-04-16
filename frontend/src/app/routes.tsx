import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Search from "./pages/Search";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageLoans from "./pages/admin/ManageLoans";
import LibraryStats from "./pages/admin/LibraryStats";

import ProtectedRoute from "./components/ProtectedRoute";

function AdminDashboardWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function ManageUsersWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <ManageUsers />
    </ProtectedRoute>
  );
}

function ManageBooksWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <ManageBooks />
    </ProtectedRoute>
  );
}

function ManageLoansWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <ManageLoans />
    </ProtectedRoute>
  );
}

function LibraryStatsWrapper() {
  return (
    <ProtectedRoute adminOnly>
      <LibraryStats />
    </ProtectedRoute>
  );
}


export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "signin", Component: SignIn },
      { path: "signup", Component: SignUp },
      { path: "search", Component: Search },

      { path: "admin", Component: AdminDashboardWrapper },
      { path: "admin/users", Component: ManageUsersWrapper },
      { path: "admin/books", Component: ManageBooksWrapper },
      { path: "admin/loans", Component: ManageLoansWrapper },
      { path: "admin/stats", Component: LibraryStatsWrapper },
    ],
  },
]);


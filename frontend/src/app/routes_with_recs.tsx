/**
 * Extended routes that include the new Recommendations page.
 * 
 * Usage: Import this file instead of ./routes in App.tsx,
 * OR update your App.tsx to use this router.
 * 
 * This extends the original routes by adding:
 *   - /recommendations → Recommendations page
 */

import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Search from "./pages/Search";
import Recommendations from "./pages/Recommendations";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageBooks from "./pages/admin/ManageBooks";
import ManageLoans from "./pages/admin/ManageLoans";
import LibraryStats from "./pages/admin/LibraryStats";

import LibrarianDashboard from "./pages/librarian/LibrarianDashboard";
import CirculationDesk from "./pages/librarian/CirculationDesk";
import MemberLookup from "./pages/librarian/MemberLookup";
import FinesDesk from "./pages/librarian/FinesDesk";

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

function LibrarianDashboardWrapper() {
  return (
    <ProtectedRoute staffOnly>
      <LibrarianDashboard />
    </ProtectedRoute>
  );
}

function CirculationDeskWrapper() {
  return (
    <ProtectedRoute staffOnly>
      <CirculationDesk />
    </ProtectedRoute>
  );
}

function MemberLookupWrapper() {
  return (
    <ProtectedRoute staffOnly>
      <MemberLookup />
    </ProtectedRoute>
  );
}

function FinesDeskWrapper() {
  return (
    <ProtectedRoute staffOnly>
      <FinesDesk />
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
      { path: "recommendations", Component: Recommendations },

      { path: "admin", Component: AdminDashboardWrapper },
      { path: "admin/users", Component: ManageUsersWrapper },
      { path: "admin/books", Component: ManageBooksWrapper },
      { path: "admin/loans", Component: ManageLoansWrapper },
      { path: "admin/stats", Component: LibraryStatsWrapper },

      { path: "librarian", Component: LibrarianDashboardWrapper },
      { path: "librarian/circulation", Component: CirculationDeskWrapper },
      { path: "librarian/members", Component: MemberLookupWrapper },
      { path: "librarian/fines", Component: FinesDeskWrapper },
    ],
  },
]);
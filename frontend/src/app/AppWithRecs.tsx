/**
 * Extended App that uses the routes_with_recs router.
 * 
 * Usage: Update main.tsx to import AppWithRecs instead of App:
 *   import App from "./AppWithRecs";
 * 
 * This is the only change needed — all new functionality
 * (recommendations page + route) is included.
 */

import { RouterProvider } from 'react-router';
import { router } from './routes_with_recs.tsx';
import { AuthProvider } from "./components/AuthContext";

export default function AppWithRecs() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
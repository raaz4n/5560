import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";

export function useUserReservations() {
  const { user } = useAuth() ?? { user: null };
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setReservations([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/reservations/me", {
        credentials: "include",
      });
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { reservations, loading, reload };
}

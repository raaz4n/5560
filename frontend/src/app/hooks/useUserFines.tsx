import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";

export function useUserFines() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchFines() {
      try {
        const res = await fetch(
          `http://localhost:8000/fines/member/${user.Member_id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        setFines(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch fines", err);
        setFines([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFines();
  }, [user]);

  return { fines, finesLoading: loading };
}

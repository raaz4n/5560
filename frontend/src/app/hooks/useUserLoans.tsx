import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";

export function useUserLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchLoans() {
      try {
        const res = await fetch(`http://localhost:8000/loans/member/${user.Member_id}`,
            {
                credentials: "include"
            }
        );
        const data = await res.json();

        console.log("Loans API response:", data);
        
        setLoans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch loans", err);
        setLoans([]); // fallback
      } finally {
        setLoading(false);
      }
    }

    fetchLoans();
  }, [user]);

  return { loans, loading };
}

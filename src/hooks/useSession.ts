import { useEffect, useState } from "react";

export const useSession = () => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const res = await fetch("http://localhost:3001/api/auth/get-session", {
					method: "GET",
					credentials: "include", // ✅ Ensures cookies are sent
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) throw new Error("Failed to fetch session");

				// this return only user data not session data.
				const data = await res.json();
				setSession(data?.user || null);
			} catch (error) {
				console.error("Session fetch error:", error);
				setSession(null);
			} finally {
				setLoading(false);
			}
		};

		fetchSession();
	}, []);

	return { session, loading };
};

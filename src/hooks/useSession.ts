import { useEffect, useState } from "react";

export const useSession = () => {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`, {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) {
					throw new Error(`Failed to fetch session: ${res.status}`);
				}

				const text = await res.text();
				if (!text) {
					setSession(null);
					return;
				}

				try {
					const data = JSON.parse(text);
					setSession(data?.user || null);
				} catch (parseError) {
					console.error("Failed to parse session response:", parseError);
					setSession(null);
				}
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

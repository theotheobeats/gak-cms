import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useSession(redirectOnAuth: boolean = false) {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState(null);
	const router = useRouter();

	useEffect(() => {
		const getSession = async () => {
			try {
				const response = await fetch(
					"http://localhost:3001/api/auth/get-session",
					{
						method: "GET",
						credentials: "include",
						headers: { "Content-Type": "application/json" },
					}
				);

				if (!response.ok) throw new Error("No active session");

				const session = await response.json();
				console.log(session);
				setUser(session.user);
			} catch (error) {
				console.error(error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		getSession();
	}, []);

	useEffect(() => {
		if (!isLoading) {
			if (user && redirectOnAuth) {
				router.push("/");
			} else if (!user && !redirectOnAuth) {
				router.push("/sign-in");
			}
		}
	}, [user, isLoading, router, redirectOnAuth]);

	return { user, isLoading };
}

// Then update your component with the types
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import Loading from "@/components/Loading";

// todo: complete and refactor the interface here and import from types.ts
interface Session {
	name: string;
	// Add any other properties your session has
	email?: string;
	id?: string;
}

const Dashboard = () => {
	const { session, loading } = useSession() as {
		session: Session | null;
		loading: boolean;
	};
	const router = useRouter();

	useEffect(() => {
		if (!loading && !session) {
			router.replace("/sign-in");
		}
	}, [session, loading, router]);

	console.log(session);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen w-full mx-auto">
				<Loading />
			</div>
		);

	if (!session) return null;

	return (
		<div className="m-8 w-full h-screen">
			<h1 className="font-bold text-2xl">Welcome, {session.name}</h1>
		</div>
	);
};

export default Dashboard;

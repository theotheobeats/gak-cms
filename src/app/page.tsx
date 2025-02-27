"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession"; // Import the session hook
import Loading from "@/components/Loading";

const Dashboard = () => {
	const { session, loading } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !session) {
			router.replace("/sign-in");
		}
	}, [session, loading, router]);

	console.log(session);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen">
				<Loading />
			</div>
		);

	if (!session) return null;

	return (
		<div>
			<h1>Dashboard</h1>
		</div>
	);
};

export default Dashboard;

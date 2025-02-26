"use client";

import { useSession } from "@/hooks/useSession";

const Dashboard = () => {
	const { isLoading } = useSession(false); // Redirect if not logged in

	if (isLoading) return <p>Loading...</p>;

	return (
		<div>
			<h1>Dashboard</h1>
		</div>
	);
};

export default Dashboard;

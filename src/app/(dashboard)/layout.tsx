"use client";

import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { session, loading } = useSession();
	const router = useRouter();
	const pathname = usePathname(); // Get current path

	useEffect(() => {
		// Only redirect if we're not already on the home page and there's a session
		if (
			!loading &&
			!session &&
			pathname !== "/login" &&
			pathname !== "/register"
		) {
			router.replace("/login");
		}
	}, [session, loading, router, pathname]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen w-full">
				<Loading />
			</div>
		);

	return (
		<div className="flex w-full h-screen">
			<Sidebar />
			{children}
		</div>
	);
};

export default Layout;

"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import Loading from "@/components/Loading";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ReactNode } from "react";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { session, loading } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!loading && session) {
			router.replace("/");
		}
	}, [session, loading, router]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen">
				<Loading />
			</div>
		);

	return (
		<div>
			<SidebarProvider>
				<DashboardSidebar />
				<main>
					<SidebarTrigger />
					{children}
				</main>
			</SidebarProvider>
		</div>
	);
};

export default Layout;

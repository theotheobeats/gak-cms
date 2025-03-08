"use client";

import Loading from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { session, loading } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Get current page title from pathname
	const getPageTitle = () => {
		const path = pathname.split("/")[1];
		return path.charAt(0).toUpperCase() + path.slice(1) || "Dashboard";
	};

	useEffect(() => {
		// Only redirect if we're not already on the home page and there's a session
		if (
			!loading &&
			!session &&
			pathname !== "/sign-in" &&
			pathname !== "/sign-up"
		) {
			router.replace("/sign-in");
		}
	}, [session, loading, router, pathname]);

	// Close sidebar when route changes on mobile
	useEffect(() => {
		setIsSidebarOpen(false);
	}, [pathname]);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen w-full">
				<Loading />
			</div>
		);

	return (
		<div className="flex w-full h-screen relative">
			{/* Mobile Header */}
			<div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="mr-4">
					{isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</Button>
				<h1 className="text-xl font-semibold">{getPageTitle()}</h1>
			</div>

			{/* Backdrop for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/50 lg:hidden z-40"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={cn(
					"fixed lg:static inset-y-0 left-0 z-50 w-[300px] transform transition-transform duration-200 ease-in-out lg:transform-none bg-white",
					isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				)}>
				<Sidebar />
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
				<div className="p-4 h-full">{children}</div>
			</div>
		</div>
	);
};

export default Layout;

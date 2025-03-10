import {
	Book,
	Camera,
	LucideDoorClosed,
	UserCheck,
	User2,
	Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const Sidebar = () => {
	const router = useRouter();
	const pathname = usePathname();

	const logout = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-out`,
				{
					method: "POST",
					credentials: "include",
				}
			);

			if (!res.ok) {
				throw new Error(`Failed to sign out: ${res.status}`);
			}

			router.push("/sign-in");
		} catch (error) {
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
			router.push("/sign-in");
		}
	};

	const menuItems = [
		{
			href: "/",
			label: "Dashboard",
			icon: Home,
			exact: true,
		},
		{
			href: "/attendance",
			label: "Absensi Jemaat",
			icon: UserCheck,
			exact: false,
		},
		{
			href: "/devotion",
			label: "Renungan",
			icon: Book,
			exact: false,
		},
		{
			href: "/documentation",
			label: "Dokumentasi",
			icon: Camera,
			exact: false,
		},
		{
			href: "/congregation",
			label: "Jemaat",
			icon: User2,
			exact: false,
		},
	];

	return (
		<div className="h-full flex flex-col border-r">
			<div className="py-4 px-6 mt-4">
				<Link href="/" className="text-2xl font-bold">
					Gereja Anugerah Kristus{" "}
					<Badge className="self-center align-middle">Palembang</Badge>
				</Link>
			</div>
			<hr className="mx-4 mb-8 mt-4" />
			<div className="flex-1 px-3">
				{menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = item.exact
						? pathname === item.href
						: pathname.startsWith(item.href) && item.href !== "/";

					return (
						<Link key={item.href} href={item.href}>
							<div
								className={cn(
									"flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors",
									isActive
										? "bg-slate-100 text-slate-900"
										: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
								)}>
								<Icon className="h-5 w-5" />
								<span>{item.label}</span>
							</div>
						</Link>
					);
				})}
			</div>

			<div className="mt-auto px-3 pb-6">
				<button
					onClick={logout}
					className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
					<LucideDoorClosed className="h-5 w-5" />
					<span>Logout</span>
				</button>
			</div>
		</div>
	);
};

export default Sidebar;

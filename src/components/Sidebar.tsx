import { Book, Camera, LucideDoorClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-hot-toast";

const Sidebar = () => {
	const router = useRouter();
	
	const logout = async () => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-out`, {
				method: "POST",
				credentials: "include",
			});

			if (!res.ok) {
				throw new Error(`Failed to sign out: ${res.status}`);
			}

			router.push("/sign-in");
		} catch (error) {
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
			// Still redirect to sign-in page even if backend fails
			router.push("/sign-in");
		}
	};

	return (
		<div className="w-[400px] flex flex-col border-r">
			<div className="p-8 cursor-pointer">
				<Link href="/" className="text-2xl font-bold">
					Dashboard
				</Link>
			</div>
			<Link href="/devotion">
				<div className="flex w-full hover:bg-slate-100 px-8 gap-4 py-4 transition-all">
					<Book />
					<div>Devotion</div>
				</div>
			</Link>
			<Link href="/documentation">
				<div className="flex w-full hover:bg-slate-100 px-8 gap-4 py-4 transition-all">
					<Camera />
					<div>Documentation</div>
				</div>
			</Link>
			<a onClick={logout}>
				<div className="flex w-full hover:bg-slate-100 px-8 gap-4 py-4 transition-all cursor-pointer">
					<LucideDoorClosed />
					<div>Logout</div>
				</div>
			</a>
		</div>
	);
};

export default Sidebar;

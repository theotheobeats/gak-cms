import { Book, Camera, LucideDoorClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Sidebar = () => {
	const router = useRouter();
	const logout = async () => {
		try {
			await fetch("http://localhost:3001/api/auth/sign-out", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.log(error);
		} finally {
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
					<div>Renungan</div>
				</div>
			</Link>
			<Link href="/devotion">
				<div className="flex w-full hover:bg-slate-100 px-8 gap-4 py-4 transition-all">
					<Camera />
					<div>Dokumentasi</div>
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

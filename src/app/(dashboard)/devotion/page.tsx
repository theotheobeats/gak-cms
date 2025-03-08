"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Devotion } from "./column";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Loading from "@/components/Loading";
import { Plus } from "lucide-react";

const Page = () => {
	const [data, setData] = useState<Devotion[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reflections/get`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch devotions");
				}

				const result = await response.json();
				setData(result);
				setError(null);
			} catch (error) {
				console.error("Error fetching devotions:", error);
				setError("Failed to load devotions. Please try again later.");
				setData([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []); // Empty dependency array means this effect runs once on mount

	return (
		<div className="h-full flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
				<h1 className="text-2xl font-bold">Devotion</h1>
				<Button asChild className="w-full sm:w-auto">
					<Link href="/devotion/create" className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						<span>Buat Renungan</span>
					</Link>
				</Button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center w-full h-32">
					<Loading />
				</div>
			) : error ? (
				<div className="w-full p-4 text-red-500 bg-red-100 rounded-md">
					{error}
				</div>
			) : (
				<div className="rounded-md border bg-white">
					<DataTable columns={columns} data={data} />
				</div>
			)}
		</div>
	);
};

export default Page;

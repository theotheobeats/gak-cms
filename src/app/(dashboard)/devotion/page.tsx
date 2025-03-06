"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns, Devotion } from "./column";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Loading from "@/components/Loading";

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
		<div className="p-8 w-full h-screen flex flex-col gap-8">
			<div className="flex w-full justify-between">
				<h1 className="text-2xl font-bold">Devotion</h1>
				<Button>
					<Link href="/devotion/create">+ Buat Renungan</Link>
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
				<DataTable columns={columns} data={data} />
			)}
		</div>
	);
};

export default Page;

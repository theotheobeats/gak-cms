"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DataTable } from "./data-table";
import { type Congregation, columns } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CongregationFormDialog } from "./congregation-form-dialog";

interface CongregationResponse {
	success: boolean;
	data: Congregation[];
}

const Page = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [congregations, setCongregations] = useState<Congregation[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchData = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/get`,
				{
					credentials: "include",
				}
			);
			const result = (await response.json()) as CongregationResponse;
			if (!result.success) throw new Error("Failed to fetch congregations");
			setCongregations(result.data);
		} catch (error) {
			console.error("Error fetching congregations:", error);
			toast.error("Gagal memuat data jemaat");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Filter congregations based on search query
	const filteredCongregations = congregations.filter((congregation) =>
		congregation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(congregation.whatsappNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
		(congregation.address?.toLowerCase() || "").includes(searchQuery.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col gap-4 p-4 md:p-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
				<h1 className="text-2xl md:text-3xl font-bold">Data Jemaat</h1>
				<CongregationFormDialog
					trigger={
						<Button className="w-full sm:w-auto">
							<Plus className="h-4 w-4 mr-2" />
							Tambah Jemaat
						</Button>
					}
					onSuccess={fetchData}
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Daftar Jemaat</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Input
							placeholder="Cari jemaat..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="max-w-sm"
						/>
					</div>
					<DataTable 
						columns={columns} 
						data={filteredCongregations} 
						meta={{
							reloadData: fetchData
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default Page;

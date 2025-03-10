"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Plus, History } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Attendance {
	id: string;
	date: string;
	congregation: {
		id: string;
		name: string;
	};
	sermonSession: {
		id: string;
		name: string;
	};
}

interface AttendanceResponse {
	success: boolean;
	data: Attendance[];
}

const Page = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [sundayAttendances, setSundayAttendances] = useState<Attendance[]>([]);
	const [allAttendances, setAllAttendances] = useState<Attendance[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Fetch Sunday attendances
				const sundayResponse = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendances/get-sunday`,
					{
						credentials: "include",
					}
				);
				const sundayResult =
					(await sundayResponse.json()) as AttendanceResponse;
				if (!sundayResult.success)
					throw new Error("Failed to fetch Sunday attendances");
				setSundayAttendances(sundayResult.data);

				// Fetch all attendances
				const allResponse = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendances/get`,
					{
						credentials: "include",
					}
				);
				const allResult = (await allResponse.json()) as AttendanceResponse;
				if (!allResult.success)
					throw new Error("Failed to fetch all attendances");
				setAllAttendances(allResult.data);
			} catch (error) {
				console.error("Error fetching attendances:", error);
				toast.error("Failed to load attendance data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Group Sunday attendances by session
	const session1Attendances = sundayAttendances.filter(
		(a) => a.sermonSession.name === "Session 1"
	);
	const session2Attendances = sundayAttendances.filter(
		(a) => a.sermonSession.name === "Session 2"
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
				<h1 className="text-2xl md:text-3xl font-bold">Absensi Jemaat</h1>
				<Button asChild className="w-full sm:w-auto">
					<Link href="/attendance/create" className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						<span>Buat Absensi</span>
					</Link>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Kebaktian Umum 1</CardTitle>
						<CardDescription>
							{format(
								new Date(sundayAttendances[0]?.date || new Date()),
								"EEEE, d MMMM yyyy",
								{ locale: id }
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{session1Attendances.length} Orang
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Kebaktian Umum 2</CardTitle>
						<CardDescription>
							{format(
								new Date(sundayAttendances[0]?.date || new Date()),
								"EEEE, d MMMM yyyy",
								{ locale: id }
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{session2Attendances.length} Orang
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-4">
				<CardHeader>
					<CardTitle>Riwayat Absensi</CardTitle>
					<CardDescription>
						Daftar absensi jemaat yang telah direkam
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tanggal</TableHead>
									<TableHead>Sesi</TableHead>
									<TableHead>Nama</TableHead>
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{allAttendances.map((attendance) => (
									<TableRow key={attendance.id}>
										<TableCell>
											{format(new Date(attendance.date), "dd/MM/yyyy HH:mm")}
										</TableCell>
										<TableCell>{attendance.sermonSession.name}</TableCell>
										<TableCell>{attendance.congregation.name}</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												asChild
												className="hover:text-primary">
												<Link
													href={`/attendance/${attendance.congregation.id}`}>
													<History className="h-4 w-4" />
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Page;

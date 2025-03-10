"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	format,
	subMonths,
	eachDayOfInterval,
	isSameDay,
	isWeekend,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Attendance {
	id: string;
	date: string;
	sermonSession: {
		id: string;
		name: string;
	};
}

interface Congregation {
	id: string;
	name: string;
	whatsappNumber: string | null;
	address: string | null;
	attendances: Attendance[];
}

interface CongregationResponse {
	success: boolean;
	data: Congregation;
}

export default function AttendanceHistoryPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [congregation, setCongregation] = useState<Congregation | null>(null);
	const { id } = React.use(params);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/get/${id}`,
					{
						credentials: "include",
					}
				);
				if (!response.ok) throw new Error("Failed to fetch congregation");
				const result = (await response.json()) as CongregationResponse;
				setCongregation(result.data);
			} catch (error) {
				console.error("Error fetching congregation:", error);
				toast.error("Failed to load attendance data");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (isLoading) {
		return (
			<div className="h-full flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!congregation) {
		return (
			<div className="h-full flex items-center justify-center">
				<p>Jemaat tidak ditemukan</p>
			</div>
		);
	}

	// Get last 6 months of Sundays
	const today = new Date();
	const sixMonthsAgo = subMonths(today, 6);

	// Ensure dates are valid before creating interval
	if (isNaN(today.getTime()) || isNaN(sixMonthsAgo.getTime())) {
		return (
			<div className="h-full flex items-center justify-center">
				<p>Error: Invalid date range</p>
			</div>
		);
	}

	const days = eachDayOfInterval({
		start: sixMonthsAgo,
		end: today,
	});
	const sundays = days.filter((day) => isWeekend(day) && day.getDay() === 0);

	// Group Sundays by month
	const sundaysByMonth = sundays.reduce<Record<string, Date[]>>(
		(acc, sunday) => {
			const monthKey = format(sunday, "MMMM yyyy", { locale: idLocale });
			if (!acc[monthKey]) {
				acc[monthKey] = [];
			}
			acc[monthKey].push(sunday);
			return acc;
		},
		{}
	);

	const totalAttendances = (congregation?.attendances || []).filter(
		(attendance) => {
			const attendanceDate = new Date(attendance.date);
			return attendanceDate >= sixMonthsAgo && attendanceDate <= today;
		}
	).length;

	return (
		<div className="h-full p-4 md:p-8">
			<div className="flex items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold">{congregation?.name}</h1>
					<p className="text-sm text-muted-foreground">
						{totalAttendances} kehadiran dari {sundays.length} minggu terakhir (
						{Math.round((totalAttendances / sundays.length) * 100)}%)
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full">
					<ArrowLeft className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex flex-wrap gap-4">
				{Object.entries(sundaysByMonth).map(([month, monthSundays]) => (
					<div
						key={month}
						className="border rounded-lg p-4 flex-shrink-0"
						style={{ minWidth: "280px", maxWidth: "calc(33.333% - 1rem)" }}>
						<h3 className="text-sm font-medium text-muted-foreground mb-3">
							{month}
						</h3>
						<div className="flex flex-wrap gap-1.5">
							{monthSundays.map((sunday) => {
								const attendance = (congregation?.attendances || []).find((a) =>
									isSameDay(new Date(a.date), sunday)
								);

								return (
									<div
										key={sunday.toISOString()}
										className={cn(
											"w-8 h-8 rounded-sm flex items-center justify-center text-xs transition-colors",
											attendance
												? "bg-green-100 text-green-700 hover:bg-green-200"
												: "bg-red-50 text-red-600 hover:bg-red-100"
										)}
										title={`${format(sunday, "d MMM", {
											locale: idLocale,
										})} - ${
											attendance ? attendance.sermonSession.name : "Tidak Hadir"
										}`}>
										{format(sunday, "d")}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 text-sm text-muted-foreground">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200" />
						<span>Hadir</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-sm bg-red-50 border border-red-100" />
						<span>Tidak Hadir</span>
					</div>
				</div>
			</div>
		</div>
	);
}

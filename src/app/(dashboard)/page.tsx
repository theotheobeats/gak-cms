"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import Loading from "@/components/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

// todo: complete and refactor the interface here and import from types.ts
interface Session {
	name: string;
	// Add any other properties your session has
	email?: string;
	id?: string;
}

// Mock data for the chart
const mockWeeklyData = {
	labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
	datasets: [
		{
			label: 'Kehadiran Jemaat',
			data: [65, 72, 68, 75],
			borderColor: 'rgb(34, 197, 94)',
			backgroundColor: 'rgba(34, 197, 94, 0.5)',
			tension: 0.3
		}
	]
};

const chartOptions = {
	responsive: true,
	plugins: {
		legend: {
			position: 'top' as const,
		},
		title: {
			display: true,
			text: 'Statistik Kehadiran Mingguan'
		}
	},
	scales: {
		y: {
			beginAtZero: true,
			title: {
				display: true,
				text: 'Jumlah Jemaat'
			}
		}
	}
};

const Dashboard = () => {
	const { session, loading } = useSession() as {
		session: Session | null;
		loading: boolean;
	};
	const router = useRouter();
	const [stats, setStats] = useState({
		totalCongregations: 0,
		activeMembers: 0,
		attendanceRate: 0
	});

	useEffect(() => {
		if (!loading && !session) {
			router.replace("/sign-in");
		}
	}, [session, loading, router]);

	useEffect(() => {
		// Mock data - replace with actual API call
		setStats({
			totalCongregations: 150,
			activeMembers: 125,
			attendanceRate: 83
		});
	}, []);

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen w-full mx-auto">
				<Loading />
			</div>
		);

	if (!session) return null;

	return (
		<div className="p-8 mx-auto">
			<div className="flex items-center justify-between mb-8">
				<h1 className="font-bold text-2xl">Welcome, {session.name}</h1>
			</div>

			<div className="grid gap-4 md:grid-cols-3 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Jemaat
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalCongregations}</div>
						<p className="text-xs text-muted-foreground">
							orang terdaftar
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Jemaat Aktif
						</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeMembers}</div>
						<p className="text-xs text-muted-foreground">
							orang aktif bulan ini
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tingkat Kehadiran
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.attendanceRate}%</div>
						<p className="text-xs text-muted-foreground">
							rata-rata kehadiran
						</p>
					</CardContent>
				</Card>
			</div>

			<Card className="col-span-4">
				<CardHeader>
					<CardTitle>Statistik Kehadiran</CardTitle>
				</CardHeader>
				<CardContent className="pl-2">
					<div className="h-[300px]">
						<Line options={chartOptions} data={mockWeeklyData} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Dashboard;

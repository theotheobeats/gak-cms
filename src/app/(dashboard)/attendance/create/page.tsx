"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface Congregation {
	id: string;
	name: string;
	hasAttendanceToday: boolean;
}

interface Attendee {
	congregationId?: string;
	name: string;
	isNewCongregation: boolean;
}

interface AttendeeRequest {
	congregationId?: string;
	name: string;
	isNewCongregation: boolean;
}

interface CongregationsResponse {
	data: Congregation[];
}

export default function CreateAttendance() {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [congregations, setCongregations] = useState<Congregation[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreatingPerson, setIsCreatingPerson] = useState(false);
	const [newPersonName, setNewPersonName] = useState("");
	const [selectedAttendees, setSelectedAttendees] = useState<Attendee[]>([]);
	const [isFetchingCongregations, setIsFetchingCongregations] = useState(false);
	const router = useRouter();

	// Fetch all congregations on mount
	React.useEffect(() => {
		const fetchCongregations = async () => {
			setIsFetchingCongregations(true);
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/congregations/get-congregations`,
					{
						credentials: "include",
					}
				);
				if (!response.ok) throw new Error("Failed to fetch congregations");
				const result = (await response.json()) as CongregationsResponse;
				setCongregations(result.data || []);
			} catch (error) {
				console.error("Error fetching congregations:", error);
				toast.error("Failed to load congregations");
				setCongregations([]);
			} finally {
				setIsFetchingCongregations(false);
			}
		};

		fetchCongregations();
	}, []);

	const handleCreatePerson = async () => {
		try {
			setIsCreatingPerson(true);
			setSelectedAttendees([
				...selectedAttendees,
				{
					name: newPersonName,
					isNewCongregation: true,
				},
			]);
			setNewPersonName("");
			setOpen(false);
			toast.success("Person added to list");
		} catch (error) {
			console.error("Error creating person:", error);
			toast.error("Failed to add person");
		} finally {
			setIsCreatingPerson(false);
		}
	};

	const handleSelectPerson = (congregation: Congregation) => {
		if (congregation.hasAttendanceToday) {
			toast.error("This person has already been marked as present today");
			return;
		}

		const isAlreadySelected = selectedAttendees.some(
			(a) => a.congregationId === congregation.id
		);
		if (!isAlreadySelected) {
			setSelectedAttendees([
				...selectedAttendees,
				{
					congregationId: congregation.id,
					name: congregation.name,
					isNewCongregation: false,
				},
			]);
		}
		setOpen(false);
		setSearch("");
	};

	const removeAttendee = (index: number) => {
		setSelectedAttendees(selectedAttendees.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedAttendees.length === 0) {
			toast.error("Please select at least one person");
			return;
		}

		setIsLoading(true);
		try {
			const attendees: AttendeeRequest[] = selectedAttendees.map(
				(attendee) => ({
					name: attendee.name,
					isNewCongregation: Boolean(attendee.isNewCongregation),
					congregationId: attendee.congregationId,
				})
			);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendances/create`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						attendees,
					}),
				}
			);

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || "Failed to record attendance");
			}

			toast.success("Attendance recorded successfully");
			router.push("/attendance");
		} catch (error) {
			console.error("Error recording attendance:", error);
			toast.error("Failed to record attendance");
		} finally {
			setIsLoading(false);
		}
	};

	// Filter congregations based on search input
	const filteredCongregations = congregations
		.filter((congregation) =>
			congregation.name.toLowerCase().includes(search.toLowerCase())
		)
		.slice(0, 5); // Limit to 5 results

	const totalResults = congregations.filter((congregation) =>
		congregation.name.toLowerCase().includes(search.toLowerCase())
	).length;

	return (
		<div className="h-full flex flex-col max-w-2xl mx-auto p-4 md:p-8">
			<div className="flex items-center gap-4 mb-8">
				<h1 className="text-2xl font-bold">
					Rekam Absensi Jemaat{" "}
					{new Date().getHours() >= 6 && new Date().getHours() < 9
						? "KU-1"
						: new Date().getHours() >= 9 && new Date().getHours() < 12
						? "KU-2"
						: ""}
				</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-4">
					<div className="flex flex-col gap-2">
						<Label>Selected Attendees ({selectedAttendees.length})</Label>
						<div className="flex flex-wrap gap-2">
							{selectedAttendees.map((attendee, index) => (
								<div
									key={index}
									className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full text-sm">
									{attendee.name}
									{attendee.isNewCongregation && (
										<span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
											New
										</span>
									)}
									<button
										type="button"
										onClick={() => removeAttendee(index)}
										className="text-muted-foreground hover:text-foreground">
										<X className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label>Add Person</Label>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full justify-between">
									<span>Search or add person...</span>
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0" align="start">
								<div className="flex flex-col">
									<div className="border-b p-2">
										<Input
											placeholder="Search person..."
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											className="border-0 focus-visible:ring-0"
										/>
									</div>
									<div className="max-h-[300px] overflow-y-auto">
										{isFetchingCongregations ? (
											<div className="flex items-center justify-center py-6">
												<Loader2 className="h-4 w-4 animate-spin" />
											</div>
										) : filteredCongregations.length > 0 ? (
											<>
												{filteredCongregations.map((congregation) => (
													<button
														key={congregation.id}
														onClick={() => handleSelectPerson(congregation)}
														disabled={congregation.hasAttendanceToday}
														className={cn(
															"flex w-full items-center gap-2 px-4 py-2 hover:bg-accent text-left text-sm",
															congregation.hasAttendanceToday &&
																"opacity-50 cursor-not-allowed"
														)}>
														<Check
															className={cn(
																"h-4 w-4",
																selectedAttendees.some(
																	(a) => a.congregationId === congregation.id
																)
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
														<span className="flex-1">{congregation.name}</span>
														{congregation.hasAttendanceToday && (
															<span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
																Present today
															</span>
														)}
													</button>
												))}
												{totalResults > 5 && (
													<div className="px-4 py-2 text-sm text-muted-foreground text-center border-t">
														{totalResults - 5} more results available. Keep typing to refine your search.
													</div>
												)}
											</>
										) : (
											<div className="p-4 text-center">
												<p className="text-sm text-muted-foreground mb-4">
													{search.trim() ? "No person found" : "Type to search..."}
												</p>
												{search.trim() && (
													<Dialog>
														<DialogTrigger asChild>
															<Button
																variant="outline"
																className="mx-auto"
																onClick={() => setNewPersonName(search)}>
																<UserPlus className="mr-2 h-4 w-4" />
																Add as new person
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Add New Person</DialogTitle>
															</DialogHeader>
															<div className="space-y-4 py-4">
																<div className="space-y-2">
																	<Label>Name</Label>
																	<Input
																		placeholder="Enter name"
																		value={newPersonName}
																		onChange={(e) =>
																			setNewPersonName(e.target.value)
																		}
																	/>
																</div>
																<Button
																	onClick={handleCreatePerson}
																	disabled={!newPersonName || isCreatingPerson}
																	className="w-full">
																	{isCreatingPerson ? "Adding..." : "Add Person"}
																</Button>
															</div>
														</DialogContent>
													</Dialog>
												)}
											</div>
										)}
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4">
					<Button
						type="button"
						variant="outline"
						className="w-full sm:w-auto"
						onClick={() => router.back()}>
						Cancel
					</Button>
					<Button
						type="submit"
						className="w-full sm:w-auto flex-1"
						disabled={
							isLoading ||
							selectedAttendees.length === 0 ||
							new Date().getDay() !== 0
						}
						onClick={(e) => {
							if (new Date().getHours() < 6) {
								e.preventDefault();
								toast.error("Absensi hanya dapat direkam setelah jam 6 pagi");
								return;
							}
							if (new Date().getDay() !== 0) {
								e.preventDefault();
								toast.error("Absensi hanya dapat direkam pada hari Minggu");
								return;
							}
						}}>
						{isLoading ? "Recording..." : "Simpan Absensi"}
					</Button>
				</div>
			</form>
		</div>
	);
}

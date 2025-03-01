"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Tiptap from "@/components/Tiptap";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Loading from "@/components/Loading";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DevotionData {
	id: string;
	title: string;
	content: string;
	status: "DRAFT" | "PUBLISHED";
	publishDate: string;
}

export default function EditDevotion({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = React.use(params);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
	const [date, setDate] = useState<Date>();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchDevotion = async () => {
			try {
				const response = await fetch(
					`http://localhost:3001/api/reflections/get/${resolvedParams.id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch devotion");
				}

				const data: DevotionData = await response.json();
				setTitle(data.title);
				setContent(data.content);
				setStatus(data.status);
				setDate(new Date(data.publishDate));
				setError(null);
			} catch (error) {
				console.error("Error fetching devotion:", error);
				setError("Failed to load devotion. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchDevotion();
	}, [resolvedParams.id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);

		if (!title || !content || !date) {
			toast.error("Title, content, and publish date are required");
			setIsSaving(false);
			return;
		}

		try {
			const response = await fetch(
				`http://localhost:3001/api/reflections/update/${resolvedParams.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						title,
						content,
						status,
						publishDate: date,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update devotion");
			}

			toast.success("Devotion updated successfully!");
			router.push("/devotion");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update devotion");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center w-full h-screen">
				<Loading />
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full p-4 text-red-500 bg-red-100 rounded-md">
				{error}
			</div>
		);
	}

	return (
		<div className="p-8 w-full flex flex-col gap-8">
			<div className="">
				<h1 className="text-2xl font-bold">Edit Devotion</h1>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="title" className="text-sm font-medium">
						Title
					</label>
					<Input
						id="title"
						placeholder="Judul Renungan"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="content" className="text-sm font-medium">
						Content
					</label>
					<Tiptap onChange={setContent} initialContent={content} />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Status</label>
						<Select
							value={status}
							onValueChange={(value: "DRAFT" | "PUBLISHED") =>
								setStatus(value)
							}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="DRAFT">Draft</SelectItem>
									<SelectItem value="PUBLISHED">Published</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Publish Date</label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={date}
									onSelect={setDate}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="flex gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						className="w-full">
						Cancel
					</Button>
					<Button type="submit" className="w-full" disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</form>
		</div>
	);
}

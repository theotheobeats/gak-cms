"use client";

import Tiptap from "@/components/Tiptap";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

export default function CreateDevotion() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
	const [date, setDate] = React.useState<Date>();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		if (!title || !content || !date) {
			toast.error("Title, content, and publish date are required");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(
				"http://localhost:3001/api/reflections/create",
				{
					method: "POST",
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
				throw new Error("Failed to create devotion");
			}

			toast.success("Devotion created successfully!");
			router.push("/devotion");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create devotion");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full p-8 flex-col space-y-8">
			<div className="">
				<h1 className="text-2xl font-bold">Create Devotion</h1>
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
					<Tiptap onChange={setContent} />
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
					{/* FIX: Publish Date is not retrieved on backend */}
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

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Publishing..." : "Publish Devotion"}
				</Button>
			</form>
		</div>
	);
}

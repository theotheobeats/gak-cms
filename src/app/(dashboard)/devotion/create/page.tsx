"use client";

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
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, Suspense } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Tiptap with SSR disabled
const Tiptap = dynamic(() => import("@/components/Tiptap"), {
	ssr: false,
	loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-md" />,
});

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
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reflections/create`,
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
		<div className="h-full flex flex-col max-w-3xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Button variant="ghost" size="icon" asChild className="lg:hidden">
					<Link href="/devotion">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-xl font-bold sm:text-2xl">Create Devotion</h1>
			</div>

			<form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
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

				<div className="space-y-2 flex-1">
					<label htmlFor="content" className="text-sm font-medium">
						Content
					</label>
					<div className="min-h-[200px] flex-1">
						<Suspense fallback={<div className="h-[200px] w-full animate-pulse bg-muted rounded-md" />}>
							<Tiptap onChange={setContent} content="" />
						</Suspense>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

				<div className="flex flex-col sm:flex-row gap-4 mt-4">
					<Button 
						type="button" 
						variant="outline" 
						className="w-full sm:w-auto" 
						onClick={() => router.back()}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button 
						type="submit" 
						className="w-full sm:w-auto flex-1" 
						disabled={isLoading}
					>
						{isLoading ? "Creating..." : "Create Devotion"}
					</Button>
				</div>
			</form>
		</div>
	);
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Devotion = {
	id: string;
	title: string;
	status: "DRAFT" | "PUBLISHED";
	publishDate: string;
	createdAt: string;
	author: string;
};

export const columns: ColumnDef<Devotion>[] = [
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "publishDate",
		header: "Publish Date",
		cell: ({ row }) => {
			const date = new Date(row.getValue("publishDate"));
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			});
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			});
		},
	},
	{
		accessorKey: "author.name",
		header: "Author",
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const status = row.getValue("status");
			const devotion = row.original;

			const handleDelete = async () => {
				try {
					const response = await fetch(
						`http://localhost:3001/api/reflections/delete/${devotion.id}`,
						{
							method: "DELETE",
							credentials: "include",
						}
					);

					if (!response.ok) {
						throw new Error("Failed to delete devotion");
					}

					// Refresh the page or update the table data
					window.location.reload();
				} catch (error) {
					console.error("Error deleting devotion:", error);
					toast.error("Failed to delete devotion");
				}
			};

			const handlePublish = async () => {
				try {
					const response = await fetch(
						`http://localhost:3001/api/reflections/publish/${devotion.id}`,
						{
							method: "PATCH",
							credentials: "include",
						}
					);

					if (!response.ok) {
						throw new Error("Failed to publish devotion");
					}

					// Refresh the page or update the table data
					window.location.reload();
				} catch (error) {
					console.error("Error publishing devotion:", error);
					toast.error("Failed to publish devotion");
				}
			};

			return (
				<div className="flex gap-2">
					<Button variant="ghost" size="icon" asChild>
						<Link href={`/devotion/${devotion.id}/edit`}>
							<Edit className="h-4 w-4" />
						</Link>
					</Button>
					<button
						className="text-red-600 hover:text-red-800"
						onClick={handleDelete}>
						<Trash2 className="h-4 w-4" />
					</button>
					{status === "DRAFT" && (
						<button
							className="text-green-600 hover:text-green-800"
							onClick={handlePublish}>
							<Send className="h-4 w-4" />
						</button>
					)}
				</div>
			);
		},
	},
];

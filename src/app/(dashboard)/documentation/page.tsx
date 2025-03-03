"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import DocumentationCard from "@/components/DocumentationCard";
import { useState } from "react";
import Link from "next/link";

interface Album {
	id: string;
	title: string;
	coverImage?: string;
	documentCount: number;
	updatedAt: string;
}

const ITEMS_PER_PAGE = 6;

const sampleAlbums: Album[] = [
	{
		id: "1",
		title: "Company Policies",
		documentCount: 15,
		updatedAt: "2024-03-10T10:00:00Z",
	},
	{
		id: "2",
		title: "Employee Handbook",
		documentCount: 8,
		updatedAt: "2024-03-09T15:30:00Z",
	},
	{
		id: "3",
		title: "Project Guidelines",
		documentCount: 12,
		updatedAt: "2024-03-08T09:15:00Z",
	},
];

export default function DocumentationPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [albums, setAlbums] = useState<Album[]>(sampleAlbums);

	const filteredAlbums = albums.filter((album) =>
		album.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedAlbums = filteredAlbums.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleDelete = (id: string) => {
		setAlbums(albums.filter((album) => album.id !== id));
	};

	return (
		<div className="p-8 w-full min-h-screen">
			{/* Header Section */}
			<div className="mx-auto">
				<div className="flex flex-col gap-8">
					{/* Title and Upload Button */}
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Documentation
							</h1>
							<p className="text-gray-500 mt-1">
								Browse and manage your documentation albums
							</p>
						</div>
						<Button asChild className="flex items-center gap-2">
							<Link href="/documentation/upload">
								<Upload className="h-4 w-4" />
								Upload Album
							</Link>
						</Button>
					</div>

					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
						<Input
							placeholder="Search documentation..."
							className="pl-10 py-6 bg-white"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1); // Reset to first page on search
							}}
						/>
					</div>

					{/* Albums Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{paginatedAlbums.map((album) => (
							<DocumentationCard
								key={album.id}
								{...album}
								onDelete={handleDelete}
							/>
						))}
					</div>

					{/* Empty State */}
					{filteredAlbums.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">No documentation albums found</p>
						</div>
					)}

					{/* Pagination */}
					{filteredAlbums.length > 0 && (
						<div className="flex items-center justify-center gap-2 mt-8">
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map(
									(page) => (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(page)}>
											{page}
										</Button>
									)
								)}
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

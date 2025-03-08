"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import DocumentationCard from "@/components/DocumentationCard";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Album {
	id: string;
	name: string;
	description: string;
	date: string;
	images: {
		id: string;
		url: string;
		alt?: string;
		caption?: string;
		width?: number;
		height?: number;
		size: number;
	}[];
}

const ITEMS_PER_PAGE = 6;

export default function DocumentationPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchAlbums();
	}, []);

	const fetchAlbums = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/albums`,
				{
					credentials: "include",
				}
			);
			if (!response.ok) {
				throw new Error("Failed to fetch albums");
			}
			const data = await response.json();
			setAlbums(data);
		} catch (error) {
			console.error("Error fetching albums:", error);
			toast.error("Failed to load albums");
		} finally {
			setIsLoading(false);
		}
	};

	const filteredAlbums = albums.filter((album) =>
		album.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedAlbums = filteredAlbums.slice(
		startIndex,
		startIndex + ITEMS_PER_PAGE
	);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top on mobile when changing pages
		if (window.innerWidth < 768) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/albums/${id}`,
				{
					method: "DELETE",
					credentials: "include",
				}
			);

			if (!response.ok) {
				throw new Error("Failed to delete album");
			}

			setAlbums(albums.filter((album) => album.id !== id));
			toast.success("Album deleted successfully");
		} catch (error) {
			console.error("Error deleting album:", error);
			toast.error("Failed to delete album");
		}
	};

	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 space-y-4 p-4 md:p-8">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
						Documentation
					</h1>
					<Button asChild className="w-full sm:w-auto">
						<Link href="/documentation/upload" className="flex items-center gap-2">
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
						className="pl-10 py-2 bg-white"
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setCurrentPage(1);
						}}
					/>
				</div>

				{/* Content Section */}
				<div className="space-y-6">
					{/* Loading State */}
					{isLoading ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className="bg-gray-100 rounded-lg h-48 animate-pulse"
								/>
							))}
						</div>
					) : (
						<>
							{/* Albums Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{paginatedAlbums.map((album) => (
									<DocumentationCard
										key={album.id}
										id={album.id}
										title={album.name}
										coverImage={album.images[0]?.url}
										documentCount={album.images.length}
										updatedAt={album.date}
										onDelete={handleDelete}
									/>
								))}
							</div>

							{/* Empty State */}
							{filteredAlbums.length === 0 && (
								<div className="text-center py-8">
									<p className="text-gray-500">No documentation albums found</p>
								</div>
							)}

							{/* Pagination */}
							{filteredAlbums.length > 0 && (
								<div className="flex items-center justify-center gap-2 py-4">
									<Button
										variant="outline"
										size="icon"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={currentPage === 1}>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<div className="hidden sm:flex items-center gap-1">
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
									<div className="sm:hidden flex items-center gap-2">
										<span className="text-sm">
											Page {currentPage} of {totalPages}
										</span>
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
						</>
					)}
				</div>
			</div>
		</div>
	);
}

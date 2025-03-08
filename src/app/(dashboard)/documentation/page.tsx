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
				"${process.env.NEXT_PUBLIC_BACKEND_URL}/api/albums",
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
		<div className="p-8 w-full min-h-screen">
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
								setCurrentPage(1);
							}}
						/>
					</div>

					{/* Loading State */}
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className="bg-gray-100 rounded-lg h-64 animate-pulse"
								/>
							))}
						</div>
					) : (
						<>
							{/* Albums Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
						</>
					)}
				</div>
			</div>
		</div>
	);
}

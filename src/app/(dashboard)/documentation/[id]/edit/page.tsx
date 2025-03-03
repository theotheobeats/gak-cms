"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { X, FileText, GripVertical } from "lucide-react";
import { useDropzone } from "react-dropzone";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { use } from "react";

interface ImageMetadata {
	id: string;
	url: string;
	alt?: string;
	caption?: string;
	width?: number;
	height?: number;
	size: number;
	file?: File;
}

interface Album {
	id: string;
	name: string;
	description: string;
	date: string;
	images: ImageMetadata[];
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function getImageDimensions(
	file: File
): Promise<{ width: number; height: number }> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.src = URL.createObjectURL(file);
	});
}

function SortableFileItem({
	fileItem,
	onRemove,
	isDeleting,
}: {
	fileItem: ImageMetadata;
	onRemove: (id: string) => void;
	isDeleting: boolean;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: fileItem.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-2 p-3 bg-white rounded-lg border group">
			<div {...attributes} {...listeners} className="cursor-grab">
				<GripVertical className="h-4 w-4 text-gray-400" />
			</div>
			<FileText className="h-4 w-4 text-gray-400" />
			<div className="flex-1 min-w-0">
				<p className="text-sm text-gray-700 truncate">
					{fileItem.file ? fileItem.file.name : fileItem.url.split("/").pop()}
				</p>
				<p className="text-xs text-gray-500">
					{formatFileSize(fileItem.size)} • {fileItem.width}x{fileItem.height}
				</p>
			</div>
			<button
				type="button"
				onClick={() => onRemove(fileItem.id)}
				disabled={isDeleting}
				className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
				{isDeleting ? (
					<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
				) : (
					<X className="h-4 w-4" />
				)}
			</button>
		</div>
	);
}

export default function EditDocumentationPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const [album, setAlbum] = useState<Album | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [images, setImages] = useState<ImageMetadata[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		fetchAlbum();
	}, [id]);

	const fetchAlbum = async () => {
		try {
			const response = await fetch(`http://localhost:3001/api/albums/${id}`, {
				credentials: "include",
			});
			if (!response.ok) {
				throw new Error("Failed to fetch album");
			}
			const data = await response.json();
			setAlbum(data);
			setName(data.name);
			setDescription(data.description);
			setImages(data.images);
		} catch (error) {
			console.error("Error fetching album:", error);
			toast.error("Failed to load album");
		} finally {
			setIsLoading(false);
		}
	};

	const validateFile = (file: File) => {
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error(
				`Invalid file type: ${file.name}. Only JPG, PNG, and GIF are allowed.`
			);
			return false;
		}
		if (file.size > MAX_FILE_SIZE) {
			toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
			return false;
		}
		return true;
	};

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		const validFiles = acceptedFiles.filter(validateFile);
		const newFilesPromises = validFiles.map(async (file) => {
			const dimensions = await getImageDimensions(file);
			return {
				id: Math.random().toString(36).substr(2, 9),
				file,
				url: URL.createObjectURL(file),
				size: file.size,
				...dimensions,
			};
		});

		const newFiles = await Promise.all(newFilesPromises);
		setImages((prev) => [...prev, ...newFiles]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/jpeg": [".jpg", ".jpeg"],
			"image/png": [".png"],
			"image/gif": [".gif"],
		},
		maxSize: MAX_FILE_SIZE,
	});

	const removeImage = async (id: string) => {
		try {
			setDeletingImageId(id);
			const response = await fetch(`http://localhost:3001/api/albums/${album?.id}/images/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error('Failed to delete image');
			}

			const updatedAlbum = await response.json();
			setAlbum(updatedAlbum);
			setImages(updatedAlbum.images);
			toast.success('Image deleted successfully');
		} catch (error) {
			console.error('Error deleting image:', error);
			toast.error('Failed to delete image');
		} finally {
			setDeletingImageId(null);
		}
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			setImages((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over?.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!album) return;

		// Validate required fields
		if (!name.trim()) {
			toast.error("Album name is required");
			return;
		}

		setIsSubmitting(true);
		setUploadProgress(0);

		try {
			const formData = new FormData();

			// Include all current data and changes
			const albumData = {
				name: name.trim(),
				description: description.trim(),
				date: new Date().toISOString(),
				images: images.map(({ ...image }) => image)
			};

			// Only proceed if there are changes
			const hasChanges = 
				name.trim() !== album.name ||
				description.trim() !== album.description ||
				images.length !== album.images.length ||
				images.some(img => img.file);

			if (!hasChanges) {
				toast("No changes to update");
				setIsSubmitting(false);
				return;
			}

			formData.append("albumData", JSON.stringify(albumData));

			// Append only new image files
			const newImages = images.filter((img) => img.file);
			newImages.forEach((image, index) => {
				if (image.file) {
					formData.append(`image_${index}`, image.file);
				}
			});

			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					setUploadProgress(progress);
				}
			});

			const response: Album = await new Promise((resolve, reject) => {
				xhr.open("PUT", `http://localhost:3001/api/albums/${id}`, true);
				xhr.withCredentials = true;
				xhr.onload = () => {
					try {
						const responseData = JSON.parse(xhr.response);
						if (xhr.status === 200) {
							resolve(responseData);
						} else {
							reject(new Error(responseData.error || "Failed to update album"));
						}
					} catch (error) {
						console.log(error);
						reject(new Error("Invalid response from server"));
					}
				};
				xhr.onerror = () => reject(new Error("Network error"));
				xhr.send(formData);
			});

			// Update local state with the response data
			if (response) {
				// Update the album state with the new data
				// Assuming you have a setAlbum function
				setAlbum(response);
			}

			toast.success("Album updated successfully!");
			router.push("/documentation");
		} catch (error) {
			console.error("Error updating album:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update album"
			);
		} finally {
			setIsSubmitting(false);
			setUploadProgress(0);
		}
	};

	if (isLoading) {
		return (
			<div className="p-8 w-full min-h-screen">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-1/4"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					<div className="h-[400px] bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (!album) {
		return (
			<div className="p-8 w-full min-h-screen">
				<div className="text-center py-12">
					<p className="text-gray-500">Album not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 w-full min-h-screen">
			<div className="mx-auto">
				<div className="flex flex-col gap-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Edit Documentation Album
						</h1>
						<p className="text-gray-500 mt-1">
							Update album details and manage images
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<label
								htmlFor="name"
								className="text-sm font-medium flex items-center gap-1">
								Album Name
								<span className="text-red-500">*</span>
							</label>
							<Input
								id="name"
								placeholder="Enter album name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className={
									!name.trim() ? "border-red-300 focus:border-red-500" : ""
								}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="description" className="text-sm font-medium">
								Description
							</label>
							<Input
								id="description"
								placeholder="Enter album description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<label className="text-sm font-medium flex items-center gap-1">
									Images
									<span className="text-red-500">*</span>
								</label>
								<span className="text-sm text-gray-500">
									{images.length} {images.length === 1 ? "image" : "images"}{" "}
									selected
								</span>
							</div>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}>
								<SortableContext
									items={images.map((f) => f.id)}
									strategy={verticalListSortingStrategy}>
									<div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
										{images.map((image) => (
											<SortableFileItem
												key={image.id}
												fileItem={image}
												onRemove={removeImage}
												isDeleting={deletingImageId === image.id}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>

							<div
								{...getRootProps()}
								className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragActive
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 hover:border-gray-400"
								}`}>
								<input {...getInputProps()} />
								<FileText className="h-8 w-8 text-gray-400 mx-auto" />
								<p className="text-sm text-gray-500 mt-2">
									{isDragActive
										? "Drop the files here"
										: "Drag and drop files here, or click to select"}
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Supported formats: JPG, PNG, GIF (max 5MB each)
								</p>
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
							<Button
								type="submit"
								className="w-full"
								disabled={isSubmitting || images.length === 0}>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Updating {Math.round(uploadProgress)}%
									</div>
								) : (
									"Update Album"
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

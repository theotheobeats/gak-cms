"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
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

// Zod schema to match backend validation
const imageMetadataSchema = z.object({
	id: z.string(),
	alt: z.string().optional(),
	caption: z.string().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	size: z.number(),
});

const createAlbumSchema = z.object({
	name: z.string().min(1, "Album name is required"),
	description: z.string(),
	date: z.string().datetime(),
	images: z.array(imageMetadataSchema),
});

type CreateAlbumSchema = z.infer<typeof createAlbumSchema>;

interface ImageMetadata {
	id: string; // Local ID for frontend management
	file: File;
	alt?: string;
	caption?: string;
	width?: number;
	height?: number;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.src = URL.createObjectURL(file);
	});
}

function SortableFileItem({ fileItem, onRemove }: { fileItem: ImageMetadata; onRemove: (id: string) => void }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: fileItem.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-2 p-3 bg-white rounded-lg border group">
			<div
				{...attributes}
				{...listeners}
				className="cursor-grab">
				<GripVertical className="h-4 w-4 text-gray-400" />
			</div>
			<FileText className="h-4 w-4 text-gray-400" />
			<div className="flex-1 min-w-0">
				<p className="text-sm text-gray-700 truncate">
					{fileItem.file.name}
				</p>
				<p className="text-xs text-gray-500">
					{formatFileSize(fileItem.file.size)} • {fileItem.width}x{fileItem.height}
				</p>
			</div>
			<button
				type="button"
				onClick={() => onRemove(fileItem.id)}
				className="p-1 text-gray-400 hover:text-red-500 transition-colors">
				<X className="h-4 w-4" />
			</button>
		</div>
	);
}

export default function UploadDocumentationPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [files, setFiles] = useState<ImageMetadata[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const validateFile = (file: File) => {
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error(`Invalid file type: ${file.name}. Only JPG, PNG, and GIF are allowed.`);
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
				file,
				id: Math.random().toString(36).substr(2, 9),
				size: file.size,
				...dimensions,
			};
		});

		const newFiles = await Promise.all(newFilesPromises);
		setFiles(prev => [...prev, ...newFiles]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/jpeg': ['.jpg', '.jpeg'],
			'image/png': ['.png'],
			'image/gif': ['.gif']
		},
		maxSize: MAX_FILE_SIZE
	});

	const removeFile = (id: string) => {
		setFiles(prev => prev.filter(file => file.id !== id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			setFiles((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over?.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Validate the data using Zod schema
			const albumData: CreateAlbumSchema = {
				name: name.trim(),
				description: description.trim(),
				date: new Date().toISOString(),
				images: files.map(({ file, id, alt, caption, width, height }) => ({
					id,
					alt: alt || file.name, // Use filename as alt if not provided
					caption,
					width,
					height,
					size: file.size,
				})),
			};

			// Validate with Zod schema
			createAlbumSchema.parse(albumData);

			setIsUploading(true);
			setUploadProgress(0);

			const formData = new FormData();
			formData.append("albumData", JSON.stringify(albumData));
			
			// Append image files separately with sequential indices
			files.forEach((fileItem, index) => {
				formData.append(`image_${index}`, fileItem.file);
			});

			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					const progress = (event.loaded / event.total) * 100;
					setUploadProgress(progress);
				}
			});

			await new Promise((resolve, reject) => {
				xhr.open("POST", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/albums/create`, true);
				xhr.withCredentials = true;
				xhr.onload = () => {
					if (xhr.status === 201) {
						resolve(xhr.response);
					} else {
						const response = JSON.parse(xhr.response);
						reject(new Error(response.error || "Failed to create album"));
					}
				};
				xhr.onerror = () => reject(new Error("Network error"));
				xhr.send(formData);
			});

			toast.success("Documentation album created successfully!");
			router.push("/documentation");
		} catch (error) {
			console.error("Error creating album:", error);
			if (error instanceof z.ZodError) {
				error.errors.forEach((err) => {
					toast.error(`Validation error: ${err.message}`);
				});
			} else {
				toast.error(error instanceof Error ? error.message : "Failed to create album");
			}
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
		}
	};

	return (
		<div className="p-8 w-full min-h-screen">
			<div className="mx-auto">
				<div className="flex flex-col gap-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Upload Documentation
						</h1>
						<p className="text-gray-500 mt-1">
							Create a new documentation album
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
								Album Name
								<span className="text-red-500">*</span>
							</label>
							<Input
								id="name"
								placeholder="Enter album name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className={!name.trim() ? "border-red-300 focus:border-red-500" : ""}
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
									{files.length} {files.length === 1 ? 'image' : 'images'} selected
								</span>
							</div>
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}>
								<SortableContext
									items={files.map(f => f.id)}
									strategy={verticalListSortingStrategy}>
									<div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
										{files.map((fileItem) => (
											<SortableFileItem
												key={fileItem.id}
												fileItem={fileItem}
												onRemove={removeFile}
											/>
										))}
									</div>
								</SortableContext>
							</DndContext>

							<div
								{...getRootProps()}
								className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
									isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
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
								disabled={isUploading || files.length === 0}>
								{isUploading ? (
									<div className="flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
										Uploading {Math.round(uploadProgress)}%
									</div>
								) : (
									"Create Album"
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

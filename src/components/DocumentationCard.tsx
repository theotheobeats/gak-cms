import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "react-hot-toast";

interface DocumentationCardProps {
    id: string;
    title: string;
    coverImage?: string;
    documentCount: number;
    updatedAt: string;
    onDelete?: (id: string) => void;
}

export default function DocumentationCard({
    id,
    title,
    coverImage,
    documentCount,
    updatedAt,
    onDelete,
}: DocumentationCardProps) {
    const handleDelete = async () => {
        try {
            // Here you would typically make an API call to delete the album
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 500));
            onDelete?.(id);
            toast.success("Album deleted successfully");
        } catch (error) {
            console.error("Error deleting album:", error);
            toast.error("Failed to delete album");
        }
    };

    return (
        <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            <Link href={`/documentation/${id}`} className="block">
                <div className="aspect-[4/3] bg-gray-100 relative">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <FileText className="h-12 w-12" />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{title}</h3>
                    <p className="text-gray-500 text-sm mt-2">
                        {documentCount} documents • Updated {formatDistanceToNow(new Date(updatedAt))} ago
                    </p>
                </div>
            </Link>

            {/* Actions Menu */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
} 
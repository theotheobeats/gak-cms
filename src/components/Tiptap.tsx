"use client";
import {
	useEditor,
	EditorContent,
	// FloatingMenu,
	BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Sparkle } from "lucide-react";
import { Button } from "./ui/button";

interface TiptapProps {
	onChange?: (content: string) => void;
	initialContent?: string;
}

const Tiptap = ({ onChange, initialContent = "<p></p>" }: TiptapProps) => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4, 5, 6],
				},
				// All these are included in StarterKit by default:
				// bold: true,
				// italic: true,
				// strike: true,
				// code: true,
				// bulletList: true,
				// orderedList: true,
				// listItem: true,
				// blockquote: true,
			}),
			// These extensions are not included in StarterKit and need to be added separately
			Underline,
			Link.configure({
				openOnClick: false,
			}),
			Image,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		content: initialContent,
		autofocus: true,
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});

	if (!editor) {
		return <div>Loading editor...</div>;
	}

	return (
		<div className="border rounded-md p-4">
			{/* Main Toolbar */}
			<div className="flex flex-wrap gap-2 p-2 border-b">
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("bold") ? "bg-gray-200" : ""
					}`}
					title="Bold">
					B
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("italic") ? "bg-gray-200" : ""
					}`}
					title="Italic">
					I
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("underline") ? "bg-gray-200" : ""
					}`}
					title="Underline">
					U
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("strike") ? "bg-gray-200" : ""
					}`}
					title="Strike">
					S
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("bulletList") ? "bg-gray-200" : ""
					}`}
					title="Bullet List">
					• List
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("orderedList") ? "bg-gray-200" : ""
					}`}
					title="Numbered List">
					1. List
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={`px-2 py-1 rounded ${
						editor.isActive("blockquote") ? "bg-gray-200" : ""
					}`}
					title="Quote">
					Quote
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={`px-2 py-1 rounded ${
						editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
					}`}
					title="Align Left">
					Left
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={`px-2 py-1 rounded ${
						editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
					}`}
					title="Align Center">
					Center
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={`px-2 py-1 rounded ${
						editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
					}`}
					title="Align Right">
					Right
				</button>
				<Button type="button" className="text-right px-2">
					Generate with AI <Sparkle />
				</Button>
			</div>

			{/* Editor Content */}
			<EditorContent editor={editor} className="min-h-64" />

			{/* Bubble Menu for quick actions when text is selected */}
			{editor && (
				<BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
					<div className="flex gap-1 bg-white p-1 rounded shadow-lg border">
						<button
							type="button"
							onClick={() => editor.chain().focus().toggleBold().run()}
							className={`px-2 py-1 rounded text-sm ${
								editor.isActive("bold") ? "bg-gray-200" : ""
							}`}>
							B
						</button>
						<button
							type="button"
							onClick={() => editor.chain().focus().toggleItalic().run()}
							className={`px-2 py-1 rounded text-sm ${
								editor.isActive("italic") ? "bg-gray-200" : ""
							}`}>
							I
						</button>
						<button
							type="button"
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							className={`px-2 py-1 rounded text-sm ${
								editor.isActive("underline") ? "bg-gray-200" : ""
							}`}>
							U
						</button>
					</div>
				</BubbleMenu>
			)}

			{/* Floating Menu when cursor is at an empty line */}
			{/* {editor && (
				<FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
					<div className="flex flex-col gap-1 bg-white p-2 rounded shadow-lg border">
						<button
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 1 }).run()
							}
							className="px-2 py-1 hover:bg-gray-100 text-left text-sm">
							Heading 1
						</button>
						<button
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 2 }).run()
							}
							className="px-2 py-1 hover:bg-gray-100 text-left text-sm">
							Heading 2
						</button>
						<button
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							className="px-2 py-1 hover:bg-gray-100 text-left text-sm">
							Bullet List
						</button>
					</div>
				</FloatingMenu>
			)} */}
		</div>
	);
};

export default Tiptap;

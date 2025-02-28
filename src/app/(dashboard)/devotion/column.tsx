"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Devotion = {
	id: string;
	title: string;
	status: "DRAFT" | "PUBLISHED";
	publishedAt: string;
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
    },
    {
        accessorKey: "publishedAt",
        header: "Published At",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
    },
    {
        accessorKey: "author",
        header: "Author",
    },
];

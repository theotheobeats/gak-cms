import React from "react";
import { DataTable } from "./data-table";
import { columns, Devotion } from "./column";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getData(): Promise<Devotion[]> {
	// Fetch data from your API here.
    return [
        {
            id: "1",
            status: "PUBLISHED",
            title: "Morning Prayer",
            publishedAt: "2023-10-01",
            createdAt: "2023-10-01",
            author: "Pdt. Daniel Ferry",
        },
        {
            id: "2",
            status: "PUBLISHED",
            title: "Evening Reflection",
            publishedAt: "2023-10-02",
            createdAt: "2023-10-02",
            author: "Pdt. Sarah Johnson",
        },
        {
            id: "3",
            status: "DRAFT",
            title: "Sunday Sermon",
            publishedAt: "2023-10-03",
            createdAt: "2023-10-03",
            author: "Pdt. Michael Lee",
        },
        {
            id: "4",
            status: "PUBLISHED",
            title: "Weekly Devotion",
            publishedAt: "2023-10-04",
            createdAt: "2023-10-04",
            author: "Pdt. Emily Davis",
        },
        {
            id: "5",
            status: "PUBLISHED",
            title: "Daily Inspiration",
            publishedAt: "2023-10-05",
            createdAt: "2023-10-05",
            author: "Pdt. John Smith",
        },
        {
            id: "6",
            status: "DRAFT",
            title: "Faith and Hope",
            publishedAt: "2023-10-06",
            createdAt: "2023-10-06",
            author: "Pdt. Anna Brown",
        },
        {
            id: "7",
            status: "PUBLISHED",
            title: "Grace and Peace",
            publishedAt: "2023-10-07",
            createdAt: "2023-10-07",
            author: "Pdt. David Wilson",
        },
        {
            id: "8",
            status: "PUBLISHED",
            title: "Love and Kindness",
            publishedAt: "2023-10-08",
            createdAt: "2023-10-08",
            author: "Pdt. Laura Martinez",
        },
        {
            id: "9",
            status: "DRAFT",
            title: "Strength and Courage",
            publishedAt: "2023-10-09",
            createdAt: "2023-10-09",
            author: "Pdt. James Anderson",
        },
        {
            id: "10",
            status: "PUBLISHED",
            title: "Hope and Faith",
            publishedAt: "2023-10-10",
            createdAt: "2023-10-10",
            author: "Pdt. Patricia Thomas",
        },
        {
            id: "11",
            status: "PUBLISHED",
            title: "Joy and Peace",
            publishedAt: "2023-10-11",
            createdAt: "2023-10-11",
            author: "Pdt. Robert Jackson",
        },
    ];
}

const page = async () => {
	const data = await getData();

	return (
		<div className="p-8 w-full h-screen flex flex-col gap-8">
			<div className="flex w-full justify-between">
				<h1 className="text-2xl font-bold">Devotion</h1>
				<Button>
					<Link href="/devotion/create">+ Buat Renungan</Link>
				</Button>
			</div>

			<DataTable columns={columns} data={data} />
		</div>
	);
};

export default page;

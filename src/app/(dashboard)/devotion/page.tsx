import React from "react";
import { DataTable } from "./data-table";
import { columns, Payment } from "./column";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getData(): Promise<Payment[]> {
	// Fetch data from your API here.
	return [
		{
			id: "728ed52f",
			amount: 100,
			status: "pending",
			email: "m@example.com",
		},
		// ...
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

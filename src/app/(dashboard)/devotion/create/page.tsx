"use client";

import Tiptap from "@/components/Tiptap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

const page = () => {
	return (
		<div className="w-full p-8 flex-col space-y-8">
			<div className="">
				<h1 className="text-2xl font-bold">Create Devotion</h1>
			</div>
            <Input placeholder="Judul Renungan"/>
			<Tiptap />
            <Button className="w-full">Publish Devotion</Button>
		</div>
	);
};

export default page;

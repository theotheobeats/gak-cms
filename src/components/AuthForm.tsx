"use client";

import { useState } from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { authFormSchema } from "@/utils/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";

const AuthForm = ({ type }: { type: string }) => {
	const formSchema = authFormSchema(type);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			if (type === "/sign-in") {
				// const result = await login(data);
				// if (result) {
				// 	toast.error("Invalid ID/Password");
				// }
			}

			// TODO: Data unique handling
			if (type === "/sign-up") {
				// const result = await signup(data);
				// console.log(result);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}
	return (
		<div className="w-full max-w-xs mx-auto h-screen flex flex-col justify-center">
			<Card className="mt-4">
				<CardHeader>
					{type === "/sign-in" ? (
						<div className="font-bold text-2xl text-center">Login to GAK CMS</div>
					) : (
						<div className="font-bold text-2xl text-center">Sign Up for GAK CMS</div>
					)}
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
							{type === "/sign-up" && (
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input placeholder="name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="password"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{type === "/sign-in" ? (
								<div>
									<Button
										type="submit"
										className="w-full mt-4"
										disabled={isLoading}>
										Sign In
									</Button>
									<p className="text-center mt-4 text-xs">
										Don&apos;t have an account? Sign up{" "}
										<Link
											href="/sign-up"
											className="underline cursor-pointer font-bold">
											here
										</Link>
									</p>
								</div>
							) : (
								<div>
									<Button
										type="submit"
										className="w-full mt-4"
										disabled={isLoading}>
										Sign Up
									</Button>
									<p className="text-center mt-4 text-xs">
										Already have an account? Sign in{" "}
										<Link
											href="/sign-in"
											className="underline cursor-pointer font-bold">
											here
										</Link>
									</p>
								</div>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default AuthForm;

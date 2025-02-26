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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthForm = ({ type }: { type: string }) => {
	const formSchema = authFormSchema(type);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

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
			const endpoint =
				type === "/sign-in"
					? "http://localhost:3001/api/auth/sign-in/email"
					: "http://localhost:3001/api/auth/sign-up/email";

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			// Handle specific response statuses
			switch (response.status) {
				case 200:
					toast.success(
						type === "/sign-in"
							? "Login successful!"
							: "Account created successfully!"
					);
					router.push("/");
					break;
				case 400:
					toast.error("Bad request. Please check your input and try again.");
					break;
				case 401:
					toast.error("Unauthorized. Invalid email or password.");
					break;
				case 403:
					toast.error("Forbidden. You don't have permission to access this.");
					break;
				case 404:
					toast.error("Not found. The requested resource is unavailable.");
					break;
				case 429:
					toast.error("Too many requests. Please wait and try again later.");
					break;
				case 500:
					toast.error("Server error. Please try again later.");
					break;
				default:
					toast.error(result.message || "An unexpected error occurred.");
					break;
			}
		} catch (error) {
			console.error(error);
			toast.error("Network error. Please check your connection.");
		} finally {
			setIsLoading(false);
		}
	}
	
	return (
		<div className="w-full max-w-xs mx-auto h-screen flex flex-col justify-center">
			<Card className="mt-4">
				<CardHeader>
					{type === "/sign-in" ? (
						<div className="font-bold text-2xl text-center">
							Login to GAK CMS
						</div>
					) : (
						<div className="font-bold text-2xl text-center">
							Sign Up for GAK CMS
						</div>
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

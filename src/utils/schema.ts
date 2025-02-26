import { z } from "zod";

export const authFormSchema = (type: string) =>
	z.object({
		name: type === "/sign-up" ? z.string().min(8) : z.string().optional(),
		email: z.string().email(),
		password: z.string().min(2),
	});

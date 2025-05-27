import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(20, { message: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9]+$/, { message: "Username must not contain special character" })

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({ message: 'Enter valid email' }),
    password: z.string().min(6, { message: 'Password must be atleast 6 characters' })
})
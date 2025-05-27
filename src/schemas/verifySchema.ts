import { z } from "zod";

export const verifySchema = z.object({
    verificationCode: z.string().length(6, { message: 'Code must be exact 6 characters' })
})
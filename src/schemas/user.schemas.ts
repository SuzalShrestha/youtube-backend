import z from "zod";

export const userSchema = z.object({
    userName: z.string(),
    email: z.string().email(),
    password: z.string(),
    fullName: z.string(),
    avatar: z.string(),
    coverImage: z.string(),
});

export type userType = z.infer<typeof userSchema>;

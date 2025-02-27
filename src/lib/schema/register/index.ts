import { z } from "zod";

export const registerValidation = z
  .object({
    username: z.string(),
    password: z.string(),
    password_confirmation: z.string(),
    email: z.string().email(),
    nama: z.string(),
    noHanphone: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password and Confirm Password not match",
    path: ["password_confirmation"],
  });

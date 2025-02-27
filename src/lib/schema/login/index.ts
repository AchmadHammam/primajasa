import { z } from "zod";

export const loginValidation = z.object({
  username: z.string(),
  password: z.string(),
  oneSignalId: z.string().optional(),
});

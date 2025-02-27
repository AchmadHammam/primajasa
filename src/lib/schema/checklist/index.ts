import { z } from "zod";

export const CreateTodolistValidation = z.object({
  title: z.string().min(1),
});

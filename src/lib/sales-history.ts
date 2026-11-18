import { z } from "zod";
import { salesInputSchema } from "./sales-analysis";

export const historySaveSchema = z.object({ id: z.string().uuid(), sales: salesInputSchema }).strict();
export const historyIdSchema = z.object({ id: z.string().uuid() }).strict();
export const profileSchema = z.object({
  display_name: z.string().trim().max(100),
  avatar_url: z.string().trim().max(2000).refine((value) => !value || (URL.canParse(value) && new URL(value).protocol === "https:"), "Use uma foto com endereço HTTPS."),
}).strict();
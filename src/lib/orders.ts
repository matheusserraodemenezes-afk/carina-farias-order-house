import { z } from "zod";

export const orderInputSchema = z.object({
  mode: z.enum(["entrega", "retirada"]),
  name: z.string().trim().min(2, "Informe o nome.").max(100),
  phone: z.string().trim().min(8, "Informe o telefone.").max(30),
  address: z.string().trim().max(300),
  payment: z.enum(["pix", "credito", "debito", "dinheiro"]),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ id: z.string().min(1).max(40), qty: z.number().int().min(1).max(100) }).strict()).min(1).max(60),
}).strict().refine((value) => value.mode === "retirada" || value.address.length >= 5, { path: ["address"], message: "Informe o endereço." });

export type OrderInput = z.infer<typeof orderInputSchema>;

export type Category = "Churrasco" | "Espetinhos" | "Acompanhamentos" | "Sucos" | "Refrigerantes" | "Água" | "Sobremesas";

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: Category;
}

export const CATEGORIES: Category[] = ["Churrasco", "Espetinhos", "Acompanhamentos", "Sucos", "Refrigerantes", "Água", "Sobremesas"];

export const MENU: MenuItem[] = [
  { id: "c1", name: "Carne e Calabresa", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "c2", name: "Carne, Calabresa e Frango", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "c3", name: "Duas Calabresa e uma Carne", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "c4", name: "Só de Calabresa", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "c5", name: "Carne e Frango", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "c6", name: "Bisteca", desc: "Churrasco na brasa", price: 20, category: "Churrasco" },
  { id: "c7", name: "Coração", desc: "Churrasco na brasa", price: 17, category: "Churrasco" },
  { id: "s1", name: "Suco de Goiaba", desc: "No copo", price: 4, category: "Sucos" },
  { id: "s2", name: "Suco de Acerola", desc: "No copo", price: 4, category: "Sucos" },
  { id: "s3", name: "Suco de Caju", desc: "No copo", price: 4, category: "Sucos" },
];

export const DELIVERY_FEE = 5;

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* Base para integração futura de pagamentos */
export type PaymentMethod = "pix" | "credito" | "debito" | "dinheiro";
export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "pix", label: "PIX" },
  { id: "credito", label: "Cartão de Crédito" },
  { id: "debito", label: "Cartão de Débito" },
  { id: "dinheiro", label: "Dinheiro" },
];
export const CARD_BRANDS = ["Visa", "Mastercard", "Elo", "Hipercard", "American Express"];

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
  { id: "c1", name: "Marmita de Churrasco", desc: "Carne na brasa, arroz, farofa, vinagrete e feijão tropeiro", price: 25, category: "Churrasco" },
  { id: "c2", name: "Picanha na Brasa (500g)", desc: "Picanha fatiada com sal grosso, ponto da casa", price: 69.9, category: "Churrasco" },
  { id: "c3", name: "Costela Fogo de Chão", desc: "12h no fogo, desmanchando", price: 45, category: "Churrasco" },
  { id: "c4", name: "Combo Família", desc: "1kg de carnes variadas + 3 acompanhamentos", price: 119.9, category: "Churrasco" },
  { id: "e1", name: "Espetinho de Carne", desc: "Alcatra temperada", price: 8, category: "Espetinhos" },
  { id: "e2", name: "Espetinho de Linguiça", desc: "Linguiça toscana artesanal", price: 7, category: "Espetinhos" },
  { id: "e3", name: "Espetinho de Frango", desc: "Coxa desossada com bacon", price: 7, category: "Espetinhos" },
  { id: "e4", name: "Coração de Galinha", desc: "Clássico da brasa", price: 8, category: "Espetinhos" },
  { id: "a1", name: "Farofa da Casa", desc: "Com bacon e ovos", price: 8, category: "Acompanhamentos" },
  { id: "a2", name: "Vinagrete", desc: "Tomate, cebola e pimentão", price: 6, category: "Acompanhamentos" },
  { id: "a3", name: "Mandioca Cozida", desc: "Na manteiga de garrafa", price: 12, category: "Acompanhamentos" },
  { id: "s1", name: "Suco de Laranja 500ml", desc: "Natural", price: 9, category: "Sucos" },
  { id: "s2", name: "Suco de Cupuaçu 500ml", desc: "Polpa da região", price: 10, category: "Sucos" },
  { id: "s3", name: "Limonada 500ml", desc: "Limão espremido na hora", price: 8, category: "Sucos" },
  { id: "r1", name: "Coca-Cola 2L", desc: "Gelada", price: 14, category: "Refrigerantes" },
  { id: "r2", name: "Guaraná Antarctica 2L", desc: "Gelado", price: 12, category: "Refrigerantes" },
  { id: "r3", name: "Refrigerante Lata 350ml", desc: "Coca, Guaraná ou Fanta", price: 6, category: "Refrigerantes" },
  { id: "w1", name: "Água Mineral 500ml", desc: "Sem gás", price: 3.5, category: "Água" },
  { id: "w2", name: "Água com Gás 500ml", desc: "Gelada", price: 4, category: "Água" },
  { id: "d1", name: "Pudim de Leite", desc: "Fatia generosa", price: 9, category: "Sobremesas" },
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

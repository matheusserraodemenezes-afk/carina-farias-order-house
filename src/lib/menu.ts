export type Category = "Churrasco" | "Espetinhos" | "Acompanhamentos" | "Sucos" | "Refrigerantes" | "Água" | "Sobremesas" | "Lanches" | "Sopas";

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: Category;
}

export const CATEGORIES: Category[] = ["Churrasco", "Espetinhos", "Acompanhamentos", "Sucos", "Refrigerantes", "Água", "Sobremesas", "Lanches", "Sopas"];

export const MENU: MenuItem[] = [
  {
    "id": "c1",
    "name": "Carne e Calabresa",
    "desc": "Espeto na brasa",
    "price": 13,
    "category": "Churrasco"
  },
  {
    "id": "c2",
    "name": "Carne com Frango e Calabresa",
    "desc": "Espeto na brasa",
    "price": 13,
    "category": "Churrasco"
  },
  {
    "id": "c5",
    "name": "Frango e Calabresa",
    "desc": "Espeto na brasa",
    "price": 13,
    "category": "Churrasco"
  },
  {
    "id": "c8",
    "name": "Espeto de Frango",
    "desc": "Espeto na brasa",
    "price": 13,
    "category": "Churrasco"
  },
  {
    "id": "c9",
    "name": "Coxa sobrecoxa",
    "desc": "Espeto na brasa",
    "price": 15,
    "category": "Churrasco"
  },
  {
    "id": "ch1",
    "name": "Carne e Calabresa na chapa",
    "desc": "Na chapa",
    "price": 13,
    "category": "Churrasco"
  },
  {
    "id": "ch2",
    "name": "Carne com Charque na chapa",
    "desc": "Na chapa",
    "price": 25,
    "category": "Churrasco"
  },
  {
    "id": "ch3",
    "name": "Charque na chapa",
    "desc": "Na chapa",
    "price": 20,
    "category": "Churrasco"
  },
  {
    "id": "sp1",
    "name": "Sopa da Carina",
    "desc": "Sopa da casa",
    "price": 10,
    "category": "Sopas"
  },
  {
    "id": "l1",
    "name": "Queijo quente",
    "desc": "2 pães de forma e queijo",
    "price": 10,
    "category": "Lanches"
  },
  {
    "id": "l2",
    "name": "Misto quente",
    "desc": "2 pães de forma, queijo e presunto",
    "price": 10,
    "category": "Lanches"
  },
  {
    "id": "l3",
    "name": "Hot dog",
    "desc": "Pão, salsicha, ovo e salada",
    "price": 10,
    "category": "Lanches"
  },
  {
    "id": "l4",
    "name": "X hot dog",
    "desc": "Pão, salsicha, queijo e salada",
    "price": 12,
    "category": "Lanches"
  },
  {
    "id": "l5",
    "name": "Eggs hot",
    "desc": "Pão, salsicha, queijo, ovo e salada",
    "price": 13,
    "category": "Lanches"
  },
  {
    "id": "l6",
    "name": "X eggs hot",
    "desc": "Pão, salsicha, queijo, presunto, ovo e salada",
    "price": 15,
    "category": "Lanches"
  },
  {
    "id": "l7",
    "name": "Hambúrguer",
    "desc": "Pão, carne, ovo e salada",
    "price": 12,
    "category": "Lanches"
  },
  {
    "id": "l8",
    "name": "X frango",
    "desc": "Pão, frango, queijo e salada",
    "price": 15,
    "category": "Lanches"
  },
  {
    "id": "l9",
    "name": "Eggs frango",
    "desc": "Pão, frango, queijo, ovo e salada",
    "price": 17,
    "category": "Lanches"
  },
  {
    "id": "l10",
    "name": "X eggs frango",
    "desc": "Pão, frango, queijo, presunto, ovo e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l11",
    "name": "X bacon",
    "desc": "Pão, carne, bacon, queijo e salada",
    "price": 15,
    "category": "Lanches"
  },
  {
    "id": "l12",
    "name": "Eggs bacon",
    "desc": "Pão, carne, bacon, ovo, queijo e salada",
    "price": 17,
    "category": "Lanches"
  },
  {
    "id": "l13",
    "name": "X eggs bacon",
    "desc": "Pão, carne, bacon, ovo, queijo, presunto e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l14",
    "name": "X calabresa",
    "desc": "Pão, carne, calabresa, queijo e salada",
    "price": 15,
    "category": "Lanches"
  },
  {
    "id": "l15",
    "name": "Eggs calabresa",
    "desc": "Pão, carne, queijo, calabresa, ovo e salada",
    "price": 17,
    "category": "Lanches"
  },
  {
    "id": "l16",
    "name": "X eggs calabresa",
    "desc": "Pão, carne, queijo, presunto, ovo, calabresa e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l17",
    "name": "Leitão",
    "desc": "Pão, leitão e salada",
    "price": 17,
    "category": "Lanches"
  },
  {
    "id": "l18",
    "name": "X leitão",
    "desc": "Pão, leitão, queijo e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l19",
    "name": "Eggs leitão",
    "desc": "Pão, leitão, queijo, ovo e salada",
    "price": 22,
    "category": "Lanches"
  },
  {
    "id": "l20",
    "name": "X eggs leitão",
    "desc": "Pão, leitão, queijo, presunto, ovo e salada",
    "price": 22,
    "category": "Lanches"
  },
  {
    "id": "l21",
    "name": "X burguer",
    "desc": "Pão, carne, queijo e salada",
    "price": 15,
    "category": "Lanches"
  },
  {
    "id": "l22",
    "name": "Eggs burguer",
    "desc": "Pão, carne, queijo, ovo e salada",
    "price": 17,
    "category": "Lanches"
  },
  {
    "id": "l23",
    "name": "X eggs burguer",
    "desc": "Pão, carne, queijo, presunto, ovo e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l24",
    "name": "Americano",
    "desc": "3 pães de forma, carne, ovo, salsicha, queijo, presunto e salada",
    "price": 20,
    "category": "Lanches"
  },
  {
    "id": "l25",
    "name": "X tudo",
    "desc": "Ingredientes a confirmar com a loja",
    "price": 35,
    "category": "Lanches"
  },
  {
    "id": "s1",
    "name": "Suco de Goiaba",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s2",
    "name": "Suco de Acerola",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s3",
    "name": "Suco de Caju",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s4",
    "name": "Suco de Manga",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s5",
    "name": "Suco de Taperebá",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s6",
    "name": "Suco de Abacaxi",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s7",
    "name": "Suco de Muruci",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s8",
    "name": "Suco de Maracujá",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s9",
    "name": "Suco de Graviola",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "s10",
    "name": "Suco de Cupuaçu",
    "desc": "400ml",
    "price": 7,
    "category": "Sucos"
  },
  {
    "id": "r1",
    "name": "Coca-Cola 1L",
    "desc": "Refrigerante",
    "price": 10,
    "category": "Refrigerantes"
  },
  {
    "id": "r2",
    "name": "Coca-Cola 1,5L",
    "desc": "Refrigerante",
    "price": 13,
    "category": "Refrigerantes"
  },
  {
    "id": "r3",
    "name": "Coca-Cola 2L",
    "desc": "Refrigerante",
    "price": 15,
    "category": "Refrigerantes"
  },
  {
    "id": "r4",
    "name": "Coca-Cola 600ml",
    "desc": "Refrigerante",
    "price": 8,
    "category": "Refrigerantes"
  },
  {
    "id": "r5",
    "name": "Coca-Cola Lata",
    "desc": "Refrigerante",
    "price": 6,
    "category": "Refrigerantes"
  },
  {
    "id": "r6",
    "name": "Pepsi 1L",
    "desc": "Refrigerante",
    "price": 10,
    "category": "Refrigerantes"
  },
  {
    "id": "r7",
    "name": "Pepsi 2L",
    "desc": "Refrigerante",
    "price": 15,
    "category": "Refrigerantes"
  },
  {
    "id": "r8",
    "name": "Tuchaua 1L",
    "desc": "Refrigerante",
    "price": 10,
    "category": "Refrigerantes"
  },
  {
    "id": "r9",
    "name": "Tuchaua 1,5L",
    "desc": "Refrigerante",
    "price": 13,
    "category": "Refrigerantes"
  },
  {
    "id": "r10",
    "name": "Tuchaua 2L",
    "desc": "Refrigerante",
    "price": 15,
    "category": "Refrigerantes"
  },
  {
    "id": "r11",
    "name": "Tuchaua Lata",
    "desc": "Refrigerante",
    "price": 6,
    "category": "Refrigerantes"
  },
  {
    "id": "r12",
    "name": "Fanta Laranja 1L",
    "desc": "Refrigerante",
    "price": 10,
    "category": "Refrigerantes"
  },
  {
    "id": "r13",
    "name": "Fanta Laranja 1,5L",
    "desc": "Refrigerante",
    "price": 13,
    "category": "Refrigerantes"
  },
  {
    "id": "r14",
    "name": "Fanta Laranja 2L",
    "desc": "Refrigerante",
    "price": 15,
    "category": "Refrigerantes"
  },
  {
    "id": "r15",
    "name": "Fanta Laranja Lata",
    "desc": "Refrigerante",
    "price": 6,
    "category": "Refrigerantes"
  },
  {
    "id": "r16",
    "name": "Fanta Uva 1L",
    "desc": "Refrigerante",
    "price": 10,
    "category": "Refrigerantes"
  },
  {
    "id": "r17",
    "name": "Fanta Uva 1,5L",
    "desc": "Refrigerante",
    "price": 13,
    "category": "Refrigerantes"
  },
  {
    "id": "r18",
    "name": "Fanta Uva 2L",
    "desc": "Refrigerante",
    "price": 15,
    "category": "Refrigerantes"
  },
  {
    "id": "r19",
    "name": "Fanta Uva Lata",
    "desc": "Refrigerante",
    "price": 6,
    "category": "Refrigerantes"
  },
  {
    "id": "r20",
    "name": "Garoto 600ml",
    "desc": "Refrigerante",
    "price": 7,
    "category": "Refrigerantes"
  }
];

export const DELIVERY_FEE = 5;

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const CONTACT = "+55 91 8038-9283";
export const CONTACT_URL = "https://wa.me/559180389283";
export const ADDRESS = "Av. Roberto Camilier, 1521 — entre Rua Nova Segunda e Quintino, Jurunas";
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Av. Roberto Camilier, 1521, Jurunas, Belém - PA")}`;
// Horário de funcionamento: preencha quando a loja confirmar (lista vazia = "consulte pelo WhatsApp").
export const OPENING_HOURS: { days: string; hours: string }[] = [{ days: "Segunda a sábado", hours: "19h à 1h" }];

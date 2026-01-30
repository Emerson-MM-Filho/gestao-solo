/**
 * Product names generator for Brazilian cafe/restaurant context
 */

import { pickRandom } from "../utils/random";

export const PRODUCT_CATEGORIES = {
  "Bebidas Quentes": [
    "Café Expresso",
    "Café Duplo",
    "Cappuccino",
    "Café com Leite",
    "Café Americano",
    "Macchiato",
    "Mocha",
    "Chocolate Quente",
    "Chá Preto",
    "Chá Verde",
  ],
  "Bebidas Frias": [
    "Suco de Laranja",
    "Suco de Limão",
    "Suco de Maracujá",
    "Suco de Abacaxi",
    "Suco de Morango",
    "Suco de Melancia",
    "Vitamina de Banana",
    "Refrigerante Lata",
    "Água Mineral",
    "Água de Coco",
    "Chá Gelado",
    "Limonada Suíça",
  ],
  Lanches: [
    "Pão na Chapa",
    "Pão de Queijo",
    "Croissant",
    "Misto Quente",
    "Omelete",
    "Tapioca",
    "Coxinha",
    "Pastel de Queijo",
    "Pastel de Carne",
    "Risole",
    "Esfiha",
    "Empada",
  ],
  Sobremesas: [
    "Bolo de Chocolate",
    "Bolo de Cenoura",
    "Brownie",
    "Cookie",
    "Pudim",
    "Mousse de Maracujá",
    "Cheesecake",
    "Torta de Limão",
    "Brigadeiro",
    "Beijinho",
    "Sonho",
    "Pão de Mel",
  ],
  Complementos: [
    "Guardanapo",
    "Copo Descartável 200ml",
    "Copo Descartável 500ml",
    "Canudo",
    "Palito",
    "Embalagem Pequena",
    "Embalagem Média",
    "Embalagem Grande",
  ],
  "Porções": [
    "Batata Frita",
    "Anéis de Cebola",
    "Calabresa Acebolada",
    "Bolinho de Bacalhau",
    "Porção de Queijo",
    "Mandioca Frita",
  ],
};

/**
 * Get all category names
 */
export function getCategoryNames(): string[] {
  return Object.keys(PRODUCT_CATEGORIES);
}

/**
 * Get products for a specific category
 */
export function getProductsByCategory(categoryName: string): string[] {
  return PRODUCT_CATEGORIES[categoryName as keyof typeof PRODUCT_CATEGORIES] || [];
}

/**
 * Generate random product name from any category
 */
export function generateProductName(): string {
  const allProducts = Object.values(PRODUCT_CATEGORIES).flat();
  return pickRandom(allProducts);
}

/**
 * Get all products with their category
 */
export function getAllProductsWithCategory(): Array<{
  name: string;
  category: string;
}> {
  const result: Array<{ name: string; category: string }> = [];

  for (const [category, products] of Object.entries(PRODUCT_CATEGORIES)) {
    for (const product of products) {
      result.push({ name: product, category });
    }
  }

  return result;
}

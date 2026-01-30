/**
 * Brazilian names generator for realistic customer data
 */

import { pickRandom } from "../utils/random";

const FIRST_NAMES = [
  // Male names
  "João",
  "Pedro",
  "Lucas",
  "Gabriel",
  "Rafael",
  "Felipe",
  "Bruno",
  "Thiago",
  "Gustavo",
  "Fernando",
  "Carlos",
  "André",
  "Marcelo",
  "Ricardo",
  "Diego",
  "Rodrigo",
  "Alexandre",
  "Daniel",
  "Paulo",
  "Matheus",
  // Female names
  "Maria",
  "Ana",
  "Julia",
  "Beatriz",
  "Larissa",
  "Fernanda",
  "Carolina",
  "Amanda",
  "Camila",
  "Juliana",
  "Patricia",
  "Mariana",
  "Isabela",
  "Leticia",
  "Bruna",
  "Gabriela",
  "Rafaela",
  "Priscila",
  "Vanessa",
  "Daniela",
];

const LAST_NAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Alves",
  "Pereira",
  "Lima",
  "Gomes",
  "Costa",
  "Ribeiro",
  "Martins",
  "Carvalho",
  "Rocha",
  "Almeida",
  "Nascimento",
  "Araujo",
  "Dias",
  "Castro",
  "Monteiro",
  "Barbosa",
  "Cardoso",
  "Cavalcanti",
  "Freitas",
  "Pinto",
  "Machado",
  "Mendes",
  "Moreira",
  "Teixeira",
];

/**
 * Generate a random Brazilian full name
 */
export function generateFullName(): string {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  return `${firstName} ${lastName}`;
}

/**
 * Generate multiple unique names
 */
export function generateUniqueNames(count: number): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10;

  while (names.size < count && attempts < maxAttempts) {
    names.add(generateFullName());
    attempts++;
  }

  return Array.from(names);
}

/**
 * Generate a first name only
 */
export function generateFirstName(): string {
  return pickRandom(FIRST_NAMES);
}

import { normalizar } from "./invitado-matcher.util";

/** Lista basica de palabras a bloquear en mensajes publicos (insultos comunes en espanol). */
const PALABRAS_BLOQUEADAS = [
  "puta",
  "puto",
  "putas",
  "putos",
  "mierda",
  "carajo",
  "pendejo",
  "pendeja",
  "idiota",
  "estupido",
  "estupida",
  "maldito",
  "maldita",
  "cabron",
  "cabrona",
  "imbecil",
  "verga",
  "cono",
  "joder",
  "perra",
  "marica",
  "maricon",
  "gonorrea",
  "conchatumadre",
  "hijueputa",
  "hdp",
];

/** true si el texto contiene alguna palabra bloqueada (insensible a mayusculas/acentos/espacios). */
export function contieneLenguajeInapropiado(texto: string): boolean {
  const normalizado = normalizar(texto);
  return PALABRAS_BLOQUEADAS.some((palabra) => {
    const patron = new RegExp(`(^|[^a-z0-9])${palabra}([^a-z0-9]|$)`, "i");
    return patron.test(normalizado);
  });
}

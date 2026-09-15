const ACCENTS: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" };

export function normalizar(s: string): string {
  const lower = s.trim().toLowerCase().replace(/\s+/g, " ");
  return lower.replace(/[áéíóúñ]/g, (c) => ACCENTS[c] ?? c);
}

/**
 * Coincidencia flexible: el "nombre" ingresado (puede ser una o varias
 * palabras, ej. "Ana Maria") debe calzar con los primeros tokens del nombre
 * guardado del invitado, y al menos una palabra de los "apellidos" ingresados
 * debe aparecer entre los tokens restantes.
 *
 * (La version original solo comparaba contra la PRIMERA palabra del
 * invitado, por lo que un nombre de pila de dos palabras como "Ana Maria"
 * nunca calzaba con "Ana Maria Vargas Tenorio" - se corrige aqui.)
 */
export function coincideConInvitado<T extends { nombre: string }>(
  invitados: T[],
  nombre: string,
  apellidos: string,
): T | null {
  const nombreTokens = normalizar(nombre).split(" ").filter(Boolean);
  const apellidosTokens = normalizar(apellidos).split(" ").filter(Boolean);
  if (nombreTokens.length === 0 || apellidosTokens.length === 0) return null;

  for (const inv of invitados) {
    const tokens = normalizar(inv.nombre).split(" ").filter(Boolean);
    if (tokens.length < nombreTokens.length) continue;

    const prefijoCalza = nombreTokens.every((t, i) => tokens[i] === t);
    if (!prefijoCalza) continue;

    const restantes = tokens.slice(nombreTokens.length);
    if (apellidosTokens.some((ap) => restantes.includes(ap))) {
      return inv;
    }
  }

  return null;
}

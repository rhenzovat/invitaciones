export type TipoRegla = "SAME_TABLE" | "SEPARATE" | "FIXED_TABLE";
export type Severidad = "HARD" | "SOFT";

export interface UnidadMesa {
  id_invitado: number;
  nombre: string;
  tamano: number;
}
export interface MesaInfo {
  id_mesa: number;
  nombre: string;
  capacidad: number;
}
export interface ReglaInfo {
  id_regla: number;
  tipo: TipoRegla;
  severidad: Severidad;
  peso: number | null;
  sujetos: number[];
  id_mesa: number | null;
  grupo?: string | null;
}

export const uid = (id: number) => `u${id}`;
export const mid = (id: number) => `m${id}`;
export const rid = (id: number) => `r${id}`;
/** "u12" -> 12 (NaN si no tiene la forma esperada: una letra y digitos). */
export const idDe = (opaco: string) => {
  const m = /^[a-z](\d+)$/.exec(String(opaco));
  return m ? Number(m[1]) : NaN;
};

/** Una unidad de asiento es el invitado que confirmo mas su acompanante (si lo registro). */
export function tamanoDeUnidad(acompanante: string | null | undefined): number {
  return 1 + ((acompanante ?? "").trim() ? 1 : 0);
}

/** Quita de cada regla los invitados que no son unidades (no confirmaron) y las reglas que quedan sin sentido. */
export function reglasAplicables(reglas: ReglaInfo[], unidades: Set<number>, mesas: Set<number>): ReglaInfo[] {
  const aplicables: ReglaInfo[] = [];
  for (const r of reglas) {
    const sujetos = [...new Set(r.sujetos)].filter((s) => unidades.has(s));
    if (r.tipo === "FIXED_TABLE") {
      if (sujetos.length === 1 && r.id_mesa != null && mesas.has(r.id_mesa)) aplicables.push({ ...r, sujetos });
    } else if (sujetos.length >= 2) {
      aplicables.push({ ...r, sujetos });
    }
  }
  return aplicables;
}

/** Arma el cuerpo de POST /v1/optimizar (contrato 1.0): solo ids opacos, sin nombres ni telefonos. */
export function armarProblema(opts: {
  problemaId: string;
  unidades: UnidadMesa[];
  mesas: MesaInfo[];
  reglas: ReglaInfo[];
  asignacionActual: Map<number, number>;
  minimizarCambios: boolean;
}) {
  const idsUnidades = new Set(opts.unidades.map((u) => u.id_invitado));
  const idsMesas = new Set(opts.mesas.map((m) => m.id_mesa));
  const reglas = reglasAplicables(opts.reglas, idsUnidades, idsMesas);
  const actual = [...opts.asignacionActual]
    .filter(([inv, mesa]) => idsUnidades.has(inv) && idsMesas.has(mesa))
    .map(([inv, mesa]) => ({ unidadId: uid(inv), mesaId: mid(mesa) }));

  return {
    contrato: "1.0",
    problemaId: opts.problemaId,
    semilla: 1,
    presupuesto: { tiempoMaxMs: 2000, semillas: 3 },
    opciones: { mantenerFijos: true, minimizarCambios: opts.minimizarCambios && actual.length > 0, lambda: 2 },
    unidades: opts.unidades.map((u) => ({ id: uid(u.id_invitado), tamano: u.tamano })),
    mesas: opts.mesas.map((m) => ({ id: mid(m.id_mesa), capacidad: m.capacidad })),
    reglas: reglas.map((r) => ({
      id: rid(r.id_regla),
      tipo: r.tipo,
      severidad: r.severidad,
      ...(r.severidad === "SOFT" ? { peso: r.peso ?? 50 } : {}),
      sujetos: r.sujetos.map(uid),
      ...(r.tipo === "FIXED_TABLE" ? { mesaId: mid(r.id_mesa as number) } : {}),
    })),
    ...(actual.length > 0 ? { asignacionActual: actual } : {}),
  };
}

export interface ResultadoVerificacion {
  excedidas: { id_mesa: number; ocupados: number; capacidad: number }[];
  violaciones: { id_regla: number; severidad: Severidad; tipo: TipoRegla; id_invitados: number[] }[];
}

/** Verificacion propia (no confia en el optimizador): capacidad de cada mesa y cumplimiento de las reglas. */
export function verificarDistribucion(
  unidades: Map<number, number>,
  mesas: Map<number, number>,
  reglas: ReglaInfo[],
  asignacion: Map<number, number>,
): ResultadoVerificacion {
  const ocupados = new Map<number, number>();
  for (const [inv, mesa] of asignacion) {
    const tamano = unidades.get(inv);
    if (tamano == null || !mesas.has(mesa)) continue;
    ocupados.set(mesa, (ocupados.get(mesa) ?? 0) + tamano);
  }
  const excedidas = [...ocupados]
    .filter(([mesa, n]) => n > (mesas.get(mesa) as number))
    .map(([id_mesa, n]) => ({ id_mesa, ocupados: n, capacidad: mesas.get(id_mesa) as number }));

  const violaciones: ResultadoVerificacion["violaciones"] = [];
  for (const r of reglasAplicables(reglas, new Set(unidades.keys()), new Set(mesas.keys()))) {
    const donde = r.sujetos.map((s) => asignacion.get(s));
    let incumple = false;
    if (r.tipo === "SAME_TABLE") {
      incumple = donde.some((d) => d == null) || new Set(donde).size > 1;
    } else if (r.tipo === "SEPARATE") {
      const asignados = donde.filter((d): d is number => d != null);
      incumple = new Set(asignados).size < asignados.length;
    } else {
      incumple = donde[0] !== r.id_mesa;
    }
    if (incumple) {
      violaciones.push({ id_regla: r.id_regla, severidad: r.severidad, tipo: r.tipo, id_invitados: r.sujetos });
    }
  }
  return { excedidas, violaciones };
}

export const GRUPO_MAX = 60;

/** Dos grupos son el mismo aunque cambien mayusculas, tildes o espacios ("Amigos  de Novia" = "amigos de novia"). */
export const claveGrupo = (g: string | null | undefined) =>
  (g ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

export interface UnidadGrupo {
  id_invitado: number;
  tamano: number;
  grupo: string | null;
}

/**
 * Una regla "juntos" por grupo. Un grupo mas grande que la mesa mas grande se parte en tandas que si caben
 * (si no, la regla nunca se podria cumplir y el optimizador la ignoraria por completo). Quien queda solo en su tanda
 * no lleva regla.
 */
export function reglasPorGrupo(unidades: UnidadGrupo[], capacidadMaxima: number): { grupo: string; sujetos: number[] }[] {
  const grupos = new Map<string, { nombre: string; miembros: UnidadGrupo[] }>();
  for (const u of unidades) {
    const clave = claveGrupo(u.grupo);
    if (!clave) continue;
    const g = grupos.get(clave) ?? { nombre: (u.grupo as string).replace(/\s+/g, " ").trim(), miembros: [] };
    g.miembros.push(u);
    grupos.set(clave, g);
  }

  const reglas: { grupo: string; sujetos: number[] }[] = [];
  for (const { nombre, miembros } of grupos.values()) {
    // Primero los mas grandes (first-fit decreasing); a igualdad, por id para que el resultado sea estable.
    const orden = [...miembros].sort((a, b) => b.tamano - a.tamano || a.id_invitado - b.id_invitado);
    const tandas: { libre: number; ids: number[] }[] = [];
    for (const u of orden) {
      if (u.tamano > capacidadMaxima) continue;
      const tanda = tandas.find((t) => t.libre >= u.tamano);
      if (tanda) {
        tanda.libre -= u.tamano;
        tanda.ids.push(u.id_invitado);
      } else {
        tandas.push({ libre: capacidadMaxima - u.tamano, ids: [u.id_invitado] });
      }
    }
    for (const t of tandas) if (t.ids.length >= 2) reglas.push({ grupo: nombre, sujetos: t.ids.sort((a, b) => a - b) });
  }
  return reglas;
}

/** Cambia los ids opacos de un mensaje del optimizador por nombres legibles. */
export function humanizar(texto: string | undefined | null, invitados: Map<number, string>, mesas: Map<number, string>): string {
  return (texto ?? "")
    .replace(/\bu(\d+)\b/g, (m, n) => invitados.get(Number(n)) ?? m)
    .replace(/\bm(\d+)\b/g, (m, n) => mesas.get(Number(n)) ?? m)
    .replace(/\b(?:regla\s+)?r(\d+)\b/gi, (_m, n) => `regla ${n}`);
}

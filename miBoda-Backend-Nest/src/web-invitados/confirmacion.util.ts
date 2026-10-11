import { EstadoRsvp } from "./dto/invitado.dto";

export type ConfirmacionManual = { asistira: "S" | "N"; acompanante: string | null };

/**
 * Traduce lo que el admin elige en el panel a lo que se guarda en
 * web_rsvp_respuestas. Devuelve null para "pendiente" (= sin respuesta, hay
 * que borrar la fila). El acompanante solo aplica si asistira y el invitado
 * tiene mas de un pase.
 */
export function resolverConfirmacion(
  estado: EstadoRsvp,
  pasesAsignados: number,
  acompanante?: string | null,
): ConfirmacionManual | null {
  if (estado === "pendiente") return null;
  const asistira = estado === "confirmado" ? "S" : "N";
  const conAcompanante = asistira === "S" && pasesAsignados > 1;
  return { asistira, acompanante: conAcompanante ? acompanante?.trim() || null : null };
}

import { BadGatewayException, Injectable, ServiceUnavailableException } from "@nestjs/common";

/** Respuesta del contrato 1.0 de oksion-optimizer (solo lo que usamos). */
export interface RespuestaOptimizador {
  estado: "CUMPLE_TODO" | "INCUMPLE_OBLIGATORIAS" | "IMPOSIBLE" | "SIN_PROBLEMA";
  parcial?: boolean;
  puntaje?: number;
  satisfaccion?: number;
  unidadesMovidas?: number;
  asignaciones?: { unidadId: string; mesaId: string; explicacion?: string }[];
  sinAsignar?: { unidadId: string; motivo?: string }[];
  violaciones?: { reglaId?: string; severidad?: string; mensaje?: string }[];
  conflictos?: { codigo?: string; mensaje?: string; sugerenciaResolucion?: string }[];
  metricas?: { tiempoMs?: number; asientosVacios?: number; totalAsignadas?: number; totalUnidades?: number };
}

/** Cliente HTTP de oksion-optimizer. La llave vive solo en variables de entorno del servidor. */
@Injectable()
export class OptimizadorClient {
  configurado(): boolean {
    return !!process.env.OPTIMIZADOR_URL?.trim() && !!process.env.OPTIMIZADOR_API_KEY?.trim();
  }

  async optimizar(problema: unknown): Promise<RespuestaOptimizador> {
    const url = (process.env.OPTIMIZADOR_URL ?? "").trim().replace(/\/+$/, "");
    const llave = (process.env.OPTIMIZADOR_API_KEY ?? "").trim();
    if (!url || !llave) {
      throw new ServiceUnavailableException(
        "El optimizador no esta configurado: faltan OPTIMIZADOR_URL y OPTIMIZADOR_API_KEY en el servidor.",
      );
    }

    let respuesta: Response;
    try {
      respuesta = await fetch(`${url}/v1/optimizar`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${llave}` },
        body: JSON.stringify(problema),
        // El plan gratis de Render duerme el servicio: la primera llamada puede tardar ~1 minuto en despertar.
        signal: AbortSignal.timeout(Number(process.env.OPTIMIZADOR_TIMEOUT_MS) || 90_000),
      });
    } catch {
      throw new ServiceUnavailableException(
        "El optimizador no respondio. Si estaba dormido (plan gratis) tarda hasta un minuto en despertar: vuelve a intentarlo.",
      );
    }

    const cuerpo = (await respuesta.json().catch(() => null)) as RespuestaOptimizador | null;
    // 422 = problema imposible: el cuerpo trae los conflictos explicados, es una respuesta util.
    if ((respuesta.status === 200 || respuesta.status === 422) && cuerpo && typeof cuerpo.estado === "string") {
      return cuerpo;
    }
    if (respuesta.status === 401) {
      throw new BadGatewayException("El optimizador rechazo la llave (revisa OPTIMIZADOR_API_KEY).");
    }
    if (respuesta.status === 429) {
      throw new ServiceUnavailableException("El optimizador esta ocupado. Intenta de nuevo en unos segundos.");
    }
    if (respuesta.status === 400) {
      throw new BadGatewayException("El optimizador rechazo los datos enviados.");
    }
    throw new BadGatewayException(`El optimizador respondio con un error (${respuesta.status}).`);
  }
}

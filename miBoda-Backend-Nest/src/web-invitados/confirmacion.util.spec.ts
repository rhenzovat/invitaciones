import { resolverConfirmacion } from "./confirmacion.util";

describe("resolverConfirmacion", () => {
  it("pendiente devuelve null (hay que borrar la respuesta)", () => {
    expect(resolverConfirmacion("pendiente", 2, "Ana")).toBeNull();
  });

  it("confirmado con 2 pases conserva el acompanante recortado", () => {
    expect(resolverConfirmacion("confirmado", 2, "  Ana Perez  ")).toEqual({
      asistira: "S",
      acompanante: "Ana Perez",
    });
  });

  it("confirmado con 1 pase descarta el acompanante", () => {
    expect(resolverConfirmacion("confirmado", 1, "Ana")).toEqual({ asistira: "S", acompanante: null });
  });

  it("no_asiste nunca guarda acompanante", () => {
    expect(resolverConfirmacion("no_asiste", 2, "Ana")).toEqual({ asistira: "N", acompanante: null });
  });

  it("acompanante vacio o en blanco queda null", () => {
    expect(resolverConfirmacion("confirmado", 2, "   ")).toEqual({ asistira: "S", acompanante: null });
    expect(resolverConfirmacion("confirmado", 2, undefined)).toEqual({ asistira: "S", acompanante: null });
  });
});

import { coincideConInvitado, normalizar } from "./invitado-matcher.util";

describe("normalizar", () => {
  it("quita acentos, pasa a minusculas y colapsa espacios", () => {
    expect(normalizar("  Renzo   VARGAS  ")).toBe("renzo vargas");
    expect(normalizar("José Ñáñez")).toBe("jose nanez");
  });
});

describe("coincideConInvitado", () => {
  const invitados = [
    { id: 1, nombre: "Renzo Vargas Tenorio" },
    { id: 2, nombre: "Yakelin Ramos Mendo" },
    { id: 3, nombre: "Ana Maria Vargas Tenorio" },
  ];

  it("coincide si el primer nombre y un apellido aparecen entre los tokens", () => {
    expect(coincideConInvitado(invitados, "Renzo", "Vargas")?.id).toBe(1);
    expect(coincideConInvitado(invitados, "renzo", "tenorio")?.id).toBe(1);
    expect(coincideConInvitado(invitados, "Renzo", "Vargas Tenorio")?.id).toBe(1);
  });

  it("coincide con un nombre de pila de DOS palabras (bug real corregido)", () => {
    expect(coincideConInvitado(invitados, "Ana Maria", "Vargas")?.id).toBe(3);
    expect(coincideConInvitado(invitados, "ana maria", "tenorio")?.id).toBe(3);
    // Escribir solo la primera palabra ("Ana") tambien debe seguir
    // funcionando (coincidencia por prefijo, no exige el nombre completo).
    expect(coincideConInvitado(invitados, "Ana", "Vargas")?.id).toBe(3);
  });

  it("es insensible a acentos y mayusculas", () => {
    expect(coincideConInvitado(invitados, "YAKELIN", "MÉNDO")?.id).toBe(2);
  });

  it("no coincide si el primer nombre no calza", () => {
    expect(coincideConInvitado(invitados, "Renzo", "Mendo")).toBeNull();
  });

  it("no coincide si ningun apellido calza", () => {
    expect(coincideConInvitado(invitados, "Renzo", "Gonzales")).toBeNull();
  });

  it("devuelve null con entradas vacias", () => {
    expect(coincideConInvitado(invitados, "", "Vargas")).toBeNull();
    expect(coincideConInvitado(invitados, "Renzo", "")).toBeNull();
  });
});

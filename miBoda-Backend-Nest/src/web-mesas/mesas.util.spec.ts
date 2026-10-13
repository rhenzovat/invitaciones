import {
  armarProblema,
  claveGrupo,
  humanizar,
  idDe,
  ReglaInfo,
  reglasAplicables,
  reglasPorGrupo,
  tamanoDeUnidad,
  verificarDistribucion,
} from "./mesas.util";

const regla = (r: Partial<ReglaInfo> & Pick<ReglaInfo, "id_regla" | "tipo" | "sujetos">): ReglaInfo => ({
  severidad: "HARD",
  peso: null,
  id_mesa: null,
  ...r,
});

describe("tamanoDeUnidad", () => {
  it("1 sin acompanante, 2 con acompanante", () => {
    expect(tamanoDeUnidad(null)).toBe(1);
    expect(tamanoDeUnidad("   ")).toBe(1);
    expect(tamanoDeUnidad("Luis")).toBe(2);
  });
});

describe("reglasAplicables", () => {
  const unidades = new Set([1, 2, 3]);
  const mesas = new Set([10]);

  it("quita invitados que no confirmaron y descarta reglas que quedan con menos de 2", () => {
    const r = reglasAplicables(
      [
        regla({ id_regla: 1, tipo: "SAME_TABLE", sujetos: [1, 2, 99] }),
        regla({ id_regla: 2, tipo: "SEPARATE", sujetos: [3, 99] }),
      ],
      unidades,
      mesas,
    );
    expect(r).toEqual([expect.objectContaining({ id_regla: 1, sujetos: [1, 2] })]);
  });

  it("FIXED_TABLE exige 1 sujeto confirmado y una mesa existente", () => {
    const r = reglasAplicables(
      [
        regla({ id_regla: 1, tipo: "FIXED_TABLE", sujetos: [1], id_mesa: 10 }),
        regla({ id_regla: 2, tipo: "FIXED_TABLE", sujetos: [1], id_mesa: 77 }),
        regla({ id_regla: 3, tipo: "FIXED_TABLE", sujetos: [99], id_mesa: 10 }),
      ],
      unidades,
      mesas,
    );
    expect(r.map((x) => x.id_regla)).toEqual([1]);
  });
});

describe("armarProblema", () => {
  const base = {
    problemaId: "p1",
    unidades: [
      { id_invitado: 1, nombre: "Ana", tamano: 2 },
      { id_invitado: 2, nombre: "Beto", tamano: 1 },
    ],
    mesas: [{ id_mesa: 10, nombre: "Mesa 1", capacidad: 8 }],
    reglas: [
      regla({ id_regla: 5, tipo: "SAME_TABLE", severidad: "SOFT", peso: 40, sujetos: [1, 2] }),
      regla({ id_regla: 6, tipo: "FIXED_TABLE", sujetos: [1], id_mesa: 10 }),
    ],
    asignacionActual: new Map<number, number>(),
    minimizarCambios: true,
  };

  it("solo envia ids opacos y respeta el contrato 1.0", () => {
    const p = armarProblema(base);
    expect(p.contrato).toBe("1.0");
    expect(p.unidades).toEqual([{ id: "u1", tamano: 2 }, { id: "u2", tamano: 1 }]);
    expect(p.mesas).toEqual([{ id: "m10", capacidad: 8 }]);
    expect(JSON.stringify(p)).not.toMatch(/Ana|Beto|Mesa 1/);
    expect(p.reglas[0]).toEqual({ id: "r5", tipo: "SAME_TABLE", severidad: "SOFT", peso: 40, sujetos: ["u1", "u2"] });
    expect(p.reglas[1]).toEqual({ id: "r6", tipo: "FIXED_TABLE", severidad: "HARD", sujetos: ["u1"], mesaId: "m10" });
    expect("peso" in p.reglas[1]).toBe(false);
    expect("asignacionActual" in p).toBe(false);
  });

  it("minimizarCambios solo se activa si ya hay asignacion actual", () => {
    expect(armarProblema(base).opciones.minimizarCambios).toBe(false);
    const p = armarProblema({ ...base, asignacionActual: new Map([[1, 10], [99, 10]]) });
    expect(p.opciones.minimizarCambios).toBe(true);
    expect(p.asignacionActual).toEqual([{ unidadId: "u1", mesaId: "m10" }]);
  });
});

describe("verificarDistribucion", () => {
  const unidades = new Map([[1, 2], [2, 2], [3, 1]]);
  const mesas = new Map([[10, 4], [20, 4]]);

  it("detecta una mesa que excede su capacidad", () => {
    const v = verificarDistribucion(unidades, mesas, [], new Map([[1, 10], [2, 10], [3, 10]]));
    expect(v.excedidas).toEqual([{ id_mesa: 10, ocupados: 5, capacidad: 4 }]);
  });

  it("SAME_TABLE se incumple si estan en mesas distintas o alguno sin mesa", () => {
    const reglas = [regla({ id_regla: 1, tipo: "SAME_TABLE", sujetos: [1, 2] })];
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10], [2, 20]])).violaciones).toHaveLength(1);
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10]])).violaciones).toHaveLength(1);
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10], [2, 10]])).violaciones).toHaveLength(0);
  });

  it("SEPARATE se incumple si comparten mesa", () => {
    const reglas = [regla({ id_regla: 2, tipo: "SEPARATE", severidad: "SOFT", peso: 10, sujetos: [1, 3] })];
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10], [3, 10]])).violaciones).toEqual([
      expect.objectContaining({ id_regla: 2, severidad: "SOFT" }),
    ]);
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10], [3, 20]])).violaciones).toHaveLength(0);
  });

  it("FIXED_TABLE se incumple si esta en otra mesa o sin mesa", () => {
    const reglas = [regla({ id_regla: 3, tipo: "FIXED_TABLE", sujetos: [1], id_mesa: 20 })];
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 10]])).violaciones).toHaveLength(1);
    expect(verificarDistribucion(unidades, mesas, reglas, new Map()).violaciones).toHaveLength(1);
    expect(verificarDistribucion(unidades, mesas, reglas, new Map([[1, 20]])).violaciones).toHaveLength(0);
  });
});

describe("humanizar / idDe", () => {
  it("reemplaza ids opacos por nombres y reglas por 'regla N'", () => {
    const inv = new Map([[2, "Ana Torres"], [3, "Beto Rios"]]);
    const mesas = new Map([[10, "Mesa 1"]]);
    expect(humanizar("u2 y u3 comparten mesa (regla r5) en m10; u9 no existe.", inv, mesas)).toBe(
      "Ana Torres y Beto Rios comparten mesa (regla 5) en Mesa 1; u9 no existe.",
    );
    expect(humanizar("Quita la regla r16 o r13.", inv, mesas)).toBe("Quita la regla 16 o regla 13.");
  });

  it("idDe extrae el numero del id opaco", () => {
    expect(idDe("u12")).toBe(12);
    expect(Number.isNaN(idDe("x"))).toBe(true);
  });
});

describe("reglasPorGrupo", () => {
  const u = (id: number, grupo: string | null, tamano = 1) => ({ id_invitado: id, tamano, grupo });

  it("una regla por grupo y sin regla para quien no tiene grupo o va solo", () => {
    const r = reglasPorGrupo([u(1, "Amigos"), u(2, "Amigos"), u(3, "Tios"), u(4, null), u(5, "  "), u(6, "Tios"), u(7, "Solo")], 10);
    expect(r).toEqual([
      { grupo: "Amigos", sujetos: [1, 2] },
      { grupo: "Tios", sujetos: [3, 6] },
    ]);
  });

  it("agrupa sin importar mayusculas, tildes ni espacios", () => {
    expect(claveGrupo("  Tíos   de NOVIA ")).toBe("tios de novia");
    const r = reglasPorGrupo([u(1, "Tíos de novia"), u(2, "tios  de NOVIA")], 10);
    expect(r).toHaveLength(1);
    expect(r[0].sujetos).toEqual([1, 2]);
  });

  it("parte un grupo mas grande que la mesa en tandas que si caben", () => {
    const miembros = Array.from({ length: 7 }, (_, i) => u(i + 1, "Uni", 2)); // 14 personas, mesa de 10
    const r = reglasPorGrupo(miembros, 10);
    expect(r.map((x) => x.sujetos.length).sort()).toEqual([2, 5]);
    for (const regla of r) expect(regla.sujetos.length * 2).toBeLessThanOrEqual(10);
    expect(r.flatMap((x) => x.sujetos).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("ignora una unidad que no cabe en ninguna mesa", () => {
    expect(reglasPorGrupo([u(1, "G", 2), u(2, "G", 2)], 1)).toEqual([]);
  });
});

import {
  armarProblema,
  humanizar,
  idDe,
  ReglaInfo,
  reglasAplicables,
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
      "Ana Torres y Beto Rios comparten mesa (regla regla 5) en Mesa 1; u9 no existe.",
    );
  });

  it("idDe extrae el numero del id opaco", () => {
    expect(idDe("u12")).toBe(12);
    expect(Number.isNaN(idDe("x"))).toBe(true);
  });
});

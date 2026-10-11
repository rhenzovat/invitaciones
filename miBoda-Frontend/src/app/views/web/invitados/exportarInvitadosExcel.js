const DORADO = "FFA16207";
const BORDE = { style: "thin", color: { argb: "FFE2D5C3" } };
const BORDES = { top: BORDE, left: BORDE, bottom: BORDE, right: BORDE };

const ESTADOS = {
  confirmado: { texto: "Confirmó", fondo: "FFDCFCE7", letra: "FF166534" },
  no_asiste: { texto: "No asiste", fondo: "FFFEE2E2", letra: "FF991B1B" },
  pendiente: { texto: "Pendiente", fondo: "FFF1F5F9", letra: "FF475569" },
};

function normalizar(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function familiaDe(notas) {
  const n = normalizar(notas);
  if (n === "novio") return "Novio";
  if (n === "novia") return "Novia";
  return "";
}

function estadoDe(inv) {
  return ESTADOS[inv.rsvp_estado] ? inv.rsvp_estado : "pendiente";
}

function tieneAcompanante(inv) {
  return estadoDe(inv) === "confirmado" && !!(inv.rsvp_acompanante || "").trim();
}

export function calcularResumen(invitados, capacidad, pasesTotales) {
  const porEstado = (e) => invitados.filter((i) => estadoDe(i) === e);
  const confirmados = porEstado("confirmado");
  const pendientes = porEstado("pendiente");
  const acompanantes = invitados.filter(tieneAcompanante).length;
  return {
    totalInvitados: invitados.length,
    pasesAsignados: pasesTotales,
    aforo: capacidad,
    confirmaron: confirmados.length,
    noAsisten: porEstado("no_asiste").length,
    sinConfirmar: pendientes.length,
    pasesSinConfirmar: pendientes.reduce((suma, i) => suma + (Number(i.pases_asignados) || 0), 0),
    acompanantes,
    personasConfirmadas: confirmados.length + acompanantes,
  };
}

function aplicarEncabezado(fila) {
  fila.height = 24;
  fila.eachCell((celda) => {
    celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DORADO } };
    celda.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    celda.border = BORDES;
  });
}

/** Arma el libro de Excel. Recibe el constructor Workbook de exceljs para poder probarlo sin el navegador. */
export function construirLibro(Workbook, { invitados, capacidad, pasesTotales, fecha = new Date() }) {
  const libro = new Workbook();
  libro.creator = "Renzo & Yakelin";
  libro.created = fecha;

  const resumen = calcularResumen(invitados, capacidad, pasesTotales);

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────
  const hojaResumen = libro.addWorksheet("Resumen", { views: [{ showGridLines: false }] });
  hojaResumen.columns = [{ width: 46 }, { width: 16 }];

  hojaResumen.mergeCells("A1:B1");
  const titulo = hojaResumen.getCell("A1");
  titulo.value = "Lista de invitados — Renzo & Yakelin";
  titulo.font = { bold: true, size: 16, color: { argb: DORADO } };
  titulo.alignment = { vertical: "middle" };
  hojaResumen.getRow(1).height = 30;

  hojaResumen.mergeCells("A2:B2");
  hojaResumen.getCell("A2").value = `Boda: 11 de noviembre de 2026 · Reporte generado el ${new Intl.DateTimeFormat("es-PE", { dateStyle: "long", timeStyle: "short" }).format(fecha)}`;
  hojaResumen.getCell("A2").font = { italic: true, color: { argb: "FF6B7280" } };

  const filas = [
    ["Invitados en la lista", resumen.totalInvitados],
    ["Pases asignados", resumen.pasesAsignados],
    ["Aforo máximo", resumen.aforo],
    null,
    ["Confirmaron asistencia", resumen.confirmaron],
    ["   Acompañantes registrados", resumen.acompanantes],
    ["Personas que asistirán (confirmados + acompañantes)", resumen.personasConfirmadas],
    ["No asisten", resumen.noAsisten],
    ["Sin confirmar (invitados)", resumen.sinConfirmar],
    ["   Pases de quienes aún no confirman", resumen.pasesSinConfirmar],
  ];
  let fila = 4;
  for (const datos of filas) {
    if (datos) {
      hojaResumen.getCell(`A${fila}`).value = datos[0];
      hojaResumen.getCell(`B${fila}`).value = datos[1];
      for (const col of ["A", "B"]) {
        const celda = hojaResumen.getCell(`${col}${fila}`);
        celda.border = BORDES;
        celda.alignment = { vertical: "middle", horizontal: col === "B" ? "center" : "left" };
      }
      hojaResumen.getCell(`B${fila}`).font = { bold: true };
    }
    fila += 1;
  }
  hojaResumen.getCell("A16").value = "El detalle por invitado, con filtros, está en la hoja «Invitados».";
  hojaResumen.getCell("A16").font = { italic: true, color: { argb: "FF6B7280" } };

  // ── Hoja 2: Invitados ────────────────────────────────────────────────────
  const hoja = libro.addWorksheet("Invitados", { views: [{ state: "frozen", ySplit: 1 }] });
  hoja.columns = [
    { header: "N°", key: "n", width: 5 },
    { header: "Nombre", key: "nombre", width: 32 },
    { header: "Celular", key: "celular", width: 16 },
    { header: "Familia", key: "familia", width: 10 },
    { header: "Pases", key: "pases", width: 8 },
    { header: "Estado", key: "estado", width: 14 },
    { header: "Acompañante", key: "acompanante", width: 28 },
    { header: "Fecha de confirmación", key: "fecha", width: 16 },
    { header: "Notas", key: "notas", width: 30 },
  ];
  aplicarEncabezado(hoja.getRow(1));

  invitados.forEach((inv, i) => {
    const estado = ESTADOS[estadoDe(inv)];
    const fechaRsvp = inv.rsvp_fecha ? new Date(inv.rsvp_fecha) : null;
    const f = hoja.addRow({
      n: i + 1,
      nombre: inv.nombre,
      celular: inv.celular || "",
      familia: familiaDe(inv.notas),
      pases: Number(inv.pases_asignados) || 0,
      estado: estado.texto,
      acompanante: (inv.rsvp_acompanante || "").trim(),
      fecha: fechaRsvp && !Number.isNaN(fechaRsvp.getTime()) ? fechaRsvp : "",
      notas: inv.notas || "",
    });
    f.alignment = { vertical: "middle", wrapText: true };
    f.eachCell((celda) => { celda.border = BORDES; });
    f.getCell("n").alignment = { vertical: "middle", horizontal: "center" };
    f.getCell("pases").alignment = { vertical: "middle", horizontal: "center" };
    f.getCell("familia").alignment = { vertical: "middle", horizontal: "center" };
    f.getCell("fecha").alignment = { vertical: "middle", horizontal: "center" };
    f.getCell("fecha").numFmt = "dd/mm/yyyy";
    f.getCell("celular").numFmt = "@";
    const celdaEstado = f.getCell("estado");
    celdaEstado.fill = { type: "pattern", pattern: "solid", fgColor: { argb: estado.fondo } };
    celdaEstado.font = { bold: true, color: { argb: estado.letra } };
    celdaEstado.alignment = { vertical: "middle", horizontal: "center" };
  });

  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 9 } };
  hoja.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "1:1" };

  return libro;
}

export function nombreArchivo(fecha = new Date()) {
  const dos = (n) => String(n).padStart(2, "0");
  return `lista_invitados_${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}.xlsx`;
}

export async function exportarInvitadosExcel({ invitados, capacidad, pasesTotales }) {
  const [{ Workbook }, { saveAs }] = await Promise.all([import("exceljs"), import("file-saver-es")]);
  const fecha = new Date();
  const libro = construirLibro(Workbook, { invitados, capacidad, pasesTotales, fecha });
  const buffer = await libro.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    nombreArchivo(fecha),
  );
}

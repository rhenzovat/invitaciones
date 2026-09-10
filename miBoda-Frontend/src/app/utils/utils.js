import { differenceInSeconds } from "date-fns";

export const convertHexToRGB = (hex) => {
  // check if it's a rgba
  if (hex.match("rgba")) {
    let triplet = hex.slice(5).split(",").slice(0, -1).join(",");
    return triplet;
  }

  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");

    return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",");
  }
};

export function getTimeDifference(date) {
  let difference = differenceInSeconds(new Date(), date);

  if (difference < 60) return `${Math.floor(difference)} sec`;
  else if (difference < 3600) return `${Math.floor(difference / 60)} min`;
  else if (difference < 86400) return `${Math.floor(difference / 3660)} h`;
  else if (difference < 86400 * 30) return `${Math.floor(difference / 86400)} d`;
  else if (difference < 86400 * 30 * 12) return `${Math.floor(difference / 86400 / 30)} mon`;
  else return `${(difference / 86400 / 30 / 12).toFixed(1)} y`;
}

//============= JORGE
export function listarEstadoSimple() {
  return [{ Valor: "S", Descripcion: "ACTIVO" }, { Valor: "N", Descripcion: "INACTIVO" }];
}

export function isNotEmpty(value) {
  return value !== undefined && value !== null && value !== "";
}

export function dateFormat(date, formats) {
  //console.log("Listar-formato-Fecha",dateFormat(Date.now(),"dd-MM-yyyy hh:mm"))
  if (date == null) return "";


  //   var a = "20250211";
  // var b = [a.slice(0, 4), "-", a.slice(4, 6), "-", a.slice(6, 8)].join('');
  // console.log(b);

  // var x = new Date(date);
  // console.log('%c [test]-47', 'font-size:13px; background:pink; color:#bf2c9f;', x)
  // var z = {
  //   Y: x.getFullYear(),
  //   M: x.getMonth() + 1,
  //   d: x.getDate(),
  //   h: x.getHours(),
  //   m: x.getMinutes(),
  //   s: x.getSeconds()
  // };

  // console.log('%c [test]-55', 'font-size:13px; background:pink; color:#bf2c9f;', z)
  /*
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
      return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))   ).slice(-2)
    });
  
    return y.replace(/(y+)/g, function (v) {
      return x.getFullYear().toString().slice(-v.length)
    });
  */
  let result = null;
  var fechaData = new Date(date);
  const yyyy = fechaData.getFullYear();
  let mm = fechaData.getMonth() + 1; // Months start at 0!
  let dd = fechaData.getDate();

  let hh = fechaData.getHours();
  let mmm = fechaData.getMinutes();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  if (hh < 10) hh = '0' + hh;
  if (mmm < 10) mmm = '0' + mmm;

  switch (formats) {

    case "yyyyMMdd":
      result = yyyy + mm + dd;
      break;

    case "yyyy/MM/dd hh:mm":
      result = yyyy + '/' + mm + '/' + dd + ' ' + hh + ':' + mmm;
      break;

    case "yyyy-MM-dd hh:mm":
      result = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mmm;
      break;


    case "dd/MM/yyyy hh:mm":
      result = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + mmm;
      break;

    case "dd-MM-yyyy hh:mm":
      result = dd + '-' + mm + '-' + yyyy + ' ' + hh + ':' + mmm;
      break;

    case "yyyy-MM-dd":
      result = yyyy + '-' + mm + '-' + dd;
      break;

    case "yyyy/MM/dd":
      result = yyyy + '/' + mm + '/' + dd;
      break;

    case "dd/MM/yyyy":
      result = dd + '/' + mm + '/' + yyyy;
      break;

    case "dd-MM-yyyy":
      result = dd + '-' + mm + '-' + yyyy;
      break;

    default:
      result = dd + '/' + mm + '/' + yyyy;
      break;
  }
  return result;

}
export function getMinusDaysBeforeAndToday(days) {
  // debugger;
  if (!isNotEmpty(days)) days = 0;
  let hoy = new Date();
  let aux = new Date();
  let antes = new Date(aux.setDate(aux.getDate() + (days * (-1))));
  let FechaInicio = new Date(antes.getFullYear(), antes.getMonth(), antes.getDate());
  let FechaFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return { FechaInicio, FechaFin }
}
export function getDayWeek(pdate) {
  let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", ''];
  let meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  //var x = document.getElementById("fecha");
  let date = new Date(pdate);//Date(x.value.replace(/-+/g, '/'));
  var fechaNum = date.getDate();
  var mon_name = date.getMonth();
  var day_name = date.getDay() - 1;
  if (day_name < 0) day_name = 6;
  console.log("day_name", day_name);
  //demo: return  Miercoles 26 de Mayo de 2021
  return dias[day_name] + " " + fechaNum + " de " + meses[mon_name] + " de " + date.getFullYear();

}

export function getDayWeekOnlyResta(pdate) {
  let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", ''];
  let date = new Date(pdate);//Date(x.value.replace(/-+/g, '/'));
  var day_name = date.getDay() - 1;
  if (day_name < 0) day_name = 6;
  return dias[day_name];
}
export function getDayWeekOnly(pdate) {
  let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", ''];
  let date = new Date(pdate);//Date(x.value.replace(/-+/g, '/'));
  var day_name = date.getDay();
  if (day_name < 0) day_name = 6;
  return dias[day_name];
}

export function rtrim(str, ch) {
  let i = str.length;
  while (i-- && str.charAt(i) === ch);
  return str.substring(0, i + 1);
  // console.log(rtrim("moo      ", "o"));
}

 
export function EstadoDelProducto() {
  return [
    { Valor: 1, Descripcion: "Pedido recibido" },
    { Valor: 2, Descripcion: "Pedido confirmado / Pago confirmado" },
    { Valor: 3, Descripcion: "Preparando pedido" },
    { Valor: 4, Descripcion: "Pedido listo" },
    { Valor: 5, Descripcion: "En camino" },
    { Valor: 6, Descripcion: "Entregado" },
    { Valor: 7, Descripcion: "Cancelado o rechazado" },
  ];
}
 
 export function EstadoDeEntrega() {
  return [
    { Valor: 1, Descripcion: "Pedido recibido" },
    { Valor: 2, Descripcion: "Pedido confirmado / Pago confirmado" },
    { Valor: 3, Descripcion: "Preparando pedido" },
    { Valor: 4, Descripcion: "Pedido listo" },
    { Valor: 5, Descripcion: "En camino" },
    { Valor: 6, Descripcion: "Entregado" },
    { Valor: 7, Descripcion: "Cancelado o rechazado" },
  ];
}

// Función auxiliar para formatear fechas
export function formatDateTimeForMySQL(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const pad = (n) => (n < 10 ? '0' + n : n);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

 export function listarDimencionPaquete() {
  return [
    { Valor:"1", Descripcion: "Pequeño" },
    { Valor: "2", Descripcion: "Mediano" },
    { Valor: "3", Descripcion: "Grande" },
  ];
}

// ============= Validadores numéricos reutilizables =============

/**
 * Valida si un string es un valor numérico permitido.
 * @param {string} value - Texto a validar
 * @param {Object} options - Opciones de validación
 * @param {boolean} options.decimals - Si se permiten decimales (default: true)
 * @param {boolean} options.allowNegative - Si se permite signo negativo (default: false)
 * @returns {boolean}
 */
export function isValidNumericInput(value, options = {}) {
  const { decimals = true, allowNegative = false } = options;
  if (value === "" || value === null || value === undefined) return true;
  const str = String(value).trim();
  if (decimals) {
    const regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
    return regex.test(str);
  }
  const regex = allowNegative ? /^-?\d*$/ : /^\d*$/;
  return regex.test(str);
}

/**
 * Filtra un string dejando solo dígitos y (opcional) un punto decimal y signo negativo.
 * Útil para normalizar valor pegado o antes de asignar a un input.
 * @param {string} value
 * @param {Object} options - { decimals, allowNegative }
 * @returns {string}
 */
export function sanitizeNumericString(value, options = {}) {
  const { decimals = true, allowNegative = false } = options;
  if (value === "" || value == null) return "";
  let str = String(value).trim();
  if (allowNegative && str.startsWith("-")) {
    str = "-" + str.slice(1).replace(/[^\d.]/g, "");
  } else {
    str = str.replace(/[^\d.]/g, "");
  }
  if (decimals) {
    const parts = str.split(".");
    if (parts.length > 2) str = parts[0] + "." + parts.slice(1).join("");
  } else {
    str = str.replace(/\./g, "");
  }
  return str;
}

/**
 * Crea manejadores reutilizables para inputs que solo deben aceptar números.
 * Úsalo en onKeyDown, onPaste y opcionalmente en onChange de TextField/input.
 * @param {Object} options - { decimals: true, allowNegative: false }
 * @returns {{ onKeyDown: (e: KeyboardEvent) => void, onPaste: (e: ClipboardEvent) => void }}
 */
export function createNumericInputHandlers(options = {}) {
  const { decimals = true, allowNegative = false } = options;

  const onKeyDown = (e) => {
    const key = e.key;
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End", "Enter"].includes(key)
    ) {
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      if (["a", "c", "v", "x", "z"].includes(key.toLowerCase())) return;
    }
    if (/[0-9]/.test(key)) return;
    if (decimals && key === ".") {
      if (!e.target.value.includes(".")) return;
    }
    if (allowNegative && key === "-" && e.target.selectionStart === 0 && !e.target.value.includes("-")) {
      return;
    }
    e.preventDefault();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const sanitized = sanitizeNumericString(pasteData, { decimals, allowNegative });
    if (sanitized === "") return;
    const input = e.target;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    let newValue = before + sanitized + after;
    newValue = sanitizeNumericString(newValue, { decimals, allowNegative });
    if (isValidNumericInput(newValue, { decimals, allowNegative })) {
      input.value = newValue;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const newCursor = Math.min(start + sanitized.length, newValue.length);
      input.setSelectionRange(newCursor, newCursor);
    }
  };

  return { onKeyDown, onPaste };
}

/** Base pública de imágenes CMS en XAMPP local (disco public_imagenes). */
const CMS_LOCAL_PUBLIC_BASE = "http://localhost/royalsensorymassage/public";

function isLocalCmsHost() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/**
 * URLs candidatas para una imagen en storage_/ (XAMPP, artisan serve, .env).
 * El componente de preview prueba la siguiente si una falla (onError).
 */
export function cmsPublicImageUrlCandidates(relativePath, absoluteUrl = null) {
  if (absoluteUrl) return [absoluteUrl];
  if (relativePath == null || relativePath === "") return [];
  const raw = String(relativePath).trim();
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return [raw];

  const path = raw.replace(/^\//, "");
  const urls = [];

  const envBase = (import.meta.env.VITE_CMS_PUBLIC_BASE || "").replace(/\/$/, "");
  if (envBase) urls.push(`${envBase}/${path}`);

  if (isLocalCmsHost()) {
    urls.push(`${CMS_LOCAL_PUBLIC_BASE}/${path}`);
  }

  const apiBase = (import.meta.env.VITE_AUTHJWT_DOMAIN || "").replace(/\/$/, "");
  if (apiBase) urls.push(`${apiBase}/${path}`);

  if (!isLocalCmsHost() && !apiBase) urls.push(`/${path}`);

  return [...new Set(urls.filter(Boolean))];
}

/**
 * Ruta relativa del backend (storage_/...) → URL para <img> en preview CMS.
 */
export function cmsPublicImageUrl(relativePath) {
  const list = cmsPublicImageUrlCandidates(relativePath);
  return list.length > 0 ? list[0] : null;
}

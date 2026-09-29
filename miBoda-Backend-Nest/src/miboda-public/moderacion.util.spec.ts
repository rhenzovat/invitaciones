import { contieneLenguajeInapropiado } from "./moderacion.util";

describe("contieneLenguajeInapropiado", () => {
  it("detecta una palabra bloqueada exacta", () => {
    expect(contieneLenguajeInapropiado("eres un idiota")).toBe(true);
  });

  it("es insensible a mayusculas y acentos", () => {
    expect(contieneLenguajeInapropiado("Que ESTÚPIDO")).toBe(true);
  });

  it("no bloquea palabras inocentes que contienen la palabra como subcadena", () => {
    expect(contieneLenguajeInapropiado("no lo pude reconocer")).toBe(false);
    expect(contieneLenguajeInapropiado("vamos a conocer el local")).toBe(false);
  });

  it("no bloquea mensajes normales", () => {
    expect(contieneLenguajeInapropiado("Felicidades a los novios, que viva el amor!")).toBe(false);
  });

  it("devuelve false con texto vacio", () => {
    expect(contieneLenguajeInapropiado("")).toBe(false);
  });
});

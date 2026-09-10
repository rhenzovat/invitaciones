import Mock from "./mock";

// Sin datos de prueba: todas las peticiones pasan al backend real
Mock.onAny().passThrough();

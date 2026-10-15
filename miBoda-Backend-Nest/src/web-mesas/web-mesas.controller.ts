import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  AceptarDto,
  ActualizarMesaDto,
  AsignarDto,
  CrearMesasDto,
  ActualizarEspacioDto,
  CrearEspacioDto,
  CrearReglaDto,
  EliminarEspacioDto,
  EntreGruposDto,
  EliminarMesaDto,
  EliminarReglaDto,
  OptimizarDto,
  PorGrupoDto,
  PosicionMesaDto,
} from "./dto/mesas.dto";
import { WebMesasService } from "./web-mesas.service";

@Controller("web_mesas")
@UseGuards(JwtAuthGuard)
export class WebMesasController {
  constructor(private readonly service: WebMesasService) {}

  @Get("listar")
  listar() {
    return this.service.listar();
  }

  @Post("crear")
  @HttpCode(HttpStatus.OK)
  crear(@Body() dto: CrearMesasDto) {
    return this.service.crearMesas(dto);
  }

  @Post("actualizar")
  @HttpCode(HttpStatus.OK)
  actualizar(@Body() dto: ActualizarMesaDto) {
    return this.service.actualizarMesa(dto);
  }

  @Post("posicion")
  @HttpCode(HttpStatus.OK)
  posicion(@Body() dto: PosicionMesaDto) {
    return this.service.moverMesa(dto);
  }

  @Post("espacios/crear")
  @HttpCode(HttpStatus.OK)
  crearEspacio(@Body() dto: CrearEspacioDto) {
    return this.service.crearEspacio(dto);
  }

  @Post("espacios/actualizar")
  @HttpCode(HttpStatus.OK)
  actualizarEspacio(@Body() dto: ActualizarEspacioDto) {
    return this.service.actualizarEspacio(dto);
  }

  @Delete("espacios/eliminar")
  eliminarEspacio(@Body() dto: EliminarEspacioDto) {
    return this.service.eliminarEspacio(dto.id_espacio);
  }

  @Delete("eliminar")
  eliminar(@Body() dto: EliminarMesaDto) {
    return this.service.eliminarMesa(dto.id_mesa);
  }

  @Post("reglas/crear")
  @HttpCode(HttpStatus.OK)
  crearRegla(@Body() dto: CrearReglaDto) {
    return this.service.crearRegla(dto);
  }

  @Post("reglas/por_grupo")
  @HttpCode(HttpStatus.OK)
  juntarPorGrupo(@Body() dto: PorGrupoDto) {
    return this.service.juntarPorGrupo(dto);
  }

  @Post("reglas/entre_grupos")
  @HttpCode(HttpStatus.OK)
  entreGrupos(@Body() dto: EntreGruposDto) {
    return this.service.entreGrupos(dto);
  }

  @Delete("reglas/eliminar")
  eliminarRegla(@Body() dto: EliminarReglaDto) {
    return this.service.eliminarRegla(dto.id_regla);
  }

  @Post("asignar")
  @HttpCode(HttpStatus.OK)
  asignar(@Body() dto: AsignarDto) {
    return this.service.asignar(dto);
  }

  @Post("limpiar")
  @HttpCode(HttpStatus.OK)
  limpiar() {
    return this.service.limpiarAsignaciones();
  }

  @Post("optimizar")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  optimizar(@Body() dto: OptimizarDto) {
    return this.service.optimizar(!!dto.minimizarCambios);
  }

  @Post("aceptar")
  @HttpCode(HttpStatus.OK)
  aceptar(@Body() dto: AceptarDto) {
    return this.service.aceptar(dto);
  }
}

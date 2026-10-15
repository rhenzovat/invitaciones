import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const recortar = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class CrearMesasDto {
  @IsInt() @Min(1) @Max(50) cantidad!: number;
  @IsInt() @Min(1) @Max(50) capacidad!: number;
}

export class ActualizarMesaDto {
  @IsInt() id_mesa!: number;
  @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(100) nombre!: string;
  @IsInt() @Min(1) @Max(50) capacidad!: number;
}

export class EliminarMesaDto {
  @IsInt() id_mesa!: number;
}

export class CrearReglaDto {
  @IsIn(["SAME_TABLE", "SEPARATE", "FIXED_TABLE"]) tipo!: "SAME_TABLE" | "SEPARATE" | "FIXED_TABLE";
  @IsIn(["HARD", "SOFT"]) severidad!: "HARD" | "SOFT";
  @IsOptional() @IsInt() @Min(1) @Max(1000) peso?: number;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @IsInt({ each: true }) sujetos!: number[];
  @IsOptional() @IsInt() id_mesa?: number;
}

export class EntreGruposDto {
  @IsIn(["SAME_TABLE", "SEPARATE"]) tipo!: "SAME_TABLE" | "SEPARATE";
  @IsIn(["HARD", "SOFT"]) severidad!: "HARD" | "SOFT";
  @IsOptional() @IsInt() @Min(1) @Max(1000) peso?: number;
  @IsArray() @ArrayMinSize(2) @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(60, { each: true }) grupos!: string[];
}

export class PosicionMesaDto {
  @IsInt() id_mesa!: number;
  @IsInt() @Min(0) @Max(5000) x!: number;
  @IsInt() @Min(0) @Max(5000) y!: number;
}

export class PorGrupoDto {
  @IsOptional() @IsInt() @Min(1) @Max(1000) peso?: number;
}

export class EliminarReglaDto {
  @IsInt() id_regla!: number;
}

export class AsignarDto {
  @IsInt() id_invitado!: number;
  @IsOptional() @IsInt() id_mesa?: number | null;
}

export class OptimizarDto {
  @IsOptional() @IsBoolean() minimizarCambios?: boolean;
}

export class AsignacionItemDto {
  @IsInt() id_invitado!: number;
  @IsInt() id_mesa!: number;
}

export class AceptarDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => AsignacionItemDto)
  asignaciones!: AsignacionItemDto[];
}

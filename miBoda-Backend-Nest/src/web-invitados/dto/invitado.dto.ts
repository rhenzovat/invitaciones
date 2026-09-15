import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CrearInvitadoDto {
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  pases_asignados!: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarInvitadoDto extends CrearInvitadoDto {
  @IsInt()
  id_invitado!: number;
}

export class EliminarInvitadoDto {
  @IsInt()
  id_invitado!: number;
}

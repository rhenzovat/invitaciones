import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from "class-validator";

const recortar = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export const ESTADOS_RSVP = ["pendiente", "confirmado", "no_asiste"] as const;
export type EstadoRsvp = (typeof ESTADOS_RSVP)[number];

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

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+()\-.\s]*$/, { message: "El celular solo puede tener números, espacios y + - ( )." })
  celular?: string;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(60)
  grupo?: string;
}

export class ActualizarInvitadoDto extends CrearInvitadoDto {
  @IsInt()
  id_invitado!: number;

  @IsOptional()
  @IsIn(ESTADOS_RSVP)
  rsvp_estado?: EstadoRsvp;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(200)
  rsvp_acompanante?: string;
}

export class EliminarInvitadoDto {
  @IsInt()
  id_invitado!: number;
}

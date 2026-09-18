import { IsString, MaxLength } from "class-validator";

export class VerificarInvitadoDto {
  @IsString() @MaxLength(200) nombre!: string;
  @IsString() @MaxLength(200) apellidos!: string;
}

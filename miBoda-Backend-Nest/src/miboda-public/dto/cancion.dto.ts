import { IsOptional, IsString, MaxLength } from "class-validator";

export class CancionDto {
  @IsString() @MaxLength(200) cancion!: string;
  @IsString() genero!: string;
  @IsOptional() @IsString() @MaxLength(200) de?: string;
}

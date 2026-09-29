import { IsOptional, IsString, MaxLength } from "class-validator";

export class MensajeDjDto {
  @IsString() @MaxLength(300) mensaje!: string;
  @IsOptional() @IsString() @MaxLength(200) de?: string;
}

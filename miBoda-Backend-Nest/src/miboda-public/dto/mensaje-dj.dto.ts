import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

const recortar = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class MensajeDjDto {
  @Transform(recortar) @IsString() @IsNotEmpty() @MaxLength(300) mensaje!: string;
  @IsOptional() @Transform(recortar) @IsString() @MaxLength(200) de?: string;
}

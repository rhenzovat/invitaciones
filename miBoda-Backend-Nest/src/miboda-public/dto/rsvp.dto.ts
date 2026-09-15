import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class RsvpDto {
  @IsString() @MaxLength(200) nombre!: string;
  @IsString() @MaxLength(200) apellidos!: string;
  @IsOptional() @IsString() @MaxLength(200) acompanante?: string;
  @IsIn(["si", "no"]) confirma!: "si" | "no";
}

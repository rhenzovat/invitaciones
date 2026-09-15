import { IsEmail } from "class-validator";

export class MetodosPorEmailDto {
  @IsEmail()
  email!: string;
}

import { Controller, Get } from "@nestjs/common";
import { PublicConfigService } from "./public-config.service";

@Controller("miboda")
export class PublicSiteController {
  constructor(private readonly configService: PublicConfigService) {}

  @Get("config")
  async config() {
    return this.configService.build();
  }

  @Get("galeria-fotos")
  async galeria() {
    return this.configService.galeria();
  }
}

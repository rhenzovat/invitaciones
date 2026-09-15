import { Module } from "@nestjs/common";
import { PublicSiteController } from "./public-site.controller";
import { PublicConfigService } from "./public-config.service";

@Module({
  controllers: [PublicSiteController],
  providers: [PublicConfigService],
})
export class PublicSiteModule {}

import { Module } from "@nestjs/common";
import { MibodaPublicController } from "./miboda-public.controller";
import { MibodaPublicService } from "./miboda-public.service";

@Module({
  controllers: [MibodaPublicController],
  providers: [MibodaPublicService],
})
export class MibodaPublicModule {}

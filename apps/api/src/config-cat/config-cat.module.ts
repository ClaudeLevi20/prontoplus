import { Global, Module } from '@nestjs/common';
import { ConfigCatService } from './config-cat.service';

@Global()
@Module({
  providers: [ConfigCatService],
  exports: [ConfigCatService],
})
export class ConfigCatModule {}

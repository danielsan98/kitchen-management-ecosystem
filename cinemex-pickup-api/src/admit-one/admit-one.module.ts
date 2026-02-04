import { Module } from '@nestjs/common';
import { AdmitOneService } from './admit-one.service';
import { AdmitOneController } from './admit-one.controller';

@Module({
  controllers: [AdmitOneController],
  providers: [AdmitOneService],
})
export class AdmitOneModule {}

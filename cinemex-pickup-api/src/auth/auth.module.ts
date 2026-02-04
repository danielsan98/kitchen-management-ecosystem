import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule,

    CommonModule

  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: []
})
export class AuthModule { }

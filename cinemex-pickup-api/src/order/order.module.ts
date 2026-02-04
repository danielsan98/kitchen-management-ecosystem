import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { HttpModule } from '@nestjs/axios';
import { Item } from '../item/entities/item.entity';
import { Branch } from '../branch/entities/branch.entity';
import { BranchModule } from '../branch/branch.module';
import { ConfigModule } from '@nestjs/config';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Order, Item, Branch, Product]),
    BranchModule,
    KeycloakModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}

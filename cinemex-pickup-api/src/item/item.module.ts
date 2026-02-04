import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { KeycloakModule } from 'src/keycloak/keycloak.module';
import { Order } from 'src/order/entities/order.entity';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Order]),
    KeycloakModule, OrderModule],

  controllers: [ItemController],
  providers: [ItemService],
  exports: [ItemService]
})
export class ItemModule { }

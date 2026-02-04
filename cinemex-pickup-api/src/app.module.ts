import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmitOneModule } from './admit-one/admit-one.module';
import { OrderModule } from './order/order.module';
import { ItemModule } from './item/item.module';
import { BranchModule } from './branch/branch.module';
import { Order } from './order/entities/order.entity';
import { Item } from './item/entities/item.entity';
import { Branch } from './branch/entities/branch.entity';
import { TasksModule } from './task/tasks.module';
import { AuthModule } from './auth/auth.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ProductModule } from './product/product.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    KeycloakModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        entities: [Order, Item, Branch],
      }),
    }),

    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: +process.env.DB_PORT,
    //   username: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   autoLoadEntities: true,
    //   synchronize: process.env.NODE_ENV === 'development',
    //   entities: [Order, Item, Branch],
    // }),

    AdmitOneModule,

    OrderModule,

    ItemModule,

    BranchModule,

    TasksModule,

    AuthModule,

    ProductModule,

    ClientsModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})

export class AppModule { }

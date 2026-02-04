import { Controller, Get, Patch, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { KcAuth } from '../keycloak/decorators/kc-auth.decorator';
import { ValidKcRoles } from '../keycloak/interfaces/kc-valid-roles.interface';
import { QueryOrderDto } from './dto/query-order.dto';
import { query } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }


  @Get('findOne')
  // @KcAuth( ValidKcRoles.admin )
  getSouceOrders(
    @Query() queryOrderDto: QueryOrderDto
  ){
    return this.orderService.getDestinationOrder(queryOrderDto);
  }

  @Get('get-orders')
  // @KcAuth( ValidKcRoles.user )
  async getOrders(@Query() queryOrderDto: QueryOrderDto) {
    return this.orderService.getOrders(queryOrderDto);
  }


  @Get('get-orders-by-branch')
  // @KcAuth( ValidKcRoles.user )
  async getOrdersByBranch(@Query('hostname') hostname: string) {
    return this.orderService.getOrdersByBranch(hostname);
  }

  //  Controlador para closeOrderById
  @Patch('close-order-by-id/:id')
  // @KcAuth( ValidKcRoles.user )
  async closeOrderById(@Query('id') id: string) {
    return this.orderService.closeOrderById(id);
  }




}

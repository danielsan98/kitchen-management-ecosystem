import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { KcAuth } from 'src/keycloak/decorators/kc-auth.decorator';
import { ValidKcRoles } from 'src/keycloak/interfaces/kc-valid-roles.interface';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) { }

  // Usar Body en lugar de Query
  @Patch('update-completed-quantity')
  // @KcAuth(ValidKcRoles.admin)
  async updateCompletedQuantity(
    @Body('transId') transId: number,
    @Body('completedQuantity') completedQuantity: number
  ): Promise<any> {
    return this.itemService.updateCompletedQuantity(
      Number(transId),
      Number(completedQuantity)
    );
  }
  // async updateCompletedQuantity(
  //   @Query('transId') transId: number,
  //   @Query('completedQuantity') completedQuantity: number
  // ): Promise<any> { 
  //   return this.itemService.updateCompletedQuantity(
  //     Number(transId),
  //     Number(completedQuantity)
  //   );
  // }

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { QueryItemDto } from './dto/query-item.dto';
import { PreparationStatusEnum } from 'src/common/enums/preparationStatusEnum';
import { Order } from 'src/order/entities/order.entity';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) 
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService
  ) {}

  async updateCompletedQuantity(transId: number, completedQuantity: number){
    // Cargar el item con su orden asociada
    const item = await this.itemRepository.findOne({ 
        where: { transId }, 
        relations: ['order'] 
    });

    if (!item) {
      throw new Error(`Item con transId ${transId} no encontrado`);
    }

    if (completedQuantity > item.quantity) {
      throw new Error(`La cantidad de items completada ${completedQuantity} excede el total de items ${item.quantity}`);
    }else if (completedQuantity < 0) {
      throw new Error(`La cantidad de items completada ${completedQuantity} no puede ser negativa`);
    } else if (completedQuantity === item.quantity) {
      // Marcar el item como completado
      item.completedQuantity = completedQuantity;
      item.preparationStatus = PreparationStatusEnum.Completed;
      const savedItem = await this.itemRepository.save(item);
      
      // Cierre de la orden
      const orderIdToClose = item.order.id; 
      
      //Items que pertenecen a la misma orden (utilizando la relación Order y su ID)
      const orderItems = await this.itemRepository.find({ 
          where: { 
              order: { id: orderIdToClose } 
          } 
      }); 

      // Verificamos si todos los ítems de la orden están completados
      const allItemsCompleted = orderItems.every(
          i => i.preparationStatus === PreparationStatusEnum.Completed
      );

      if (allItemsCompleted) {
          // Si todos están completados, cerramos la orden
          const order = await this.orderRepository.findOne({ where: { id: orderIdToClose } });
          if (order) {
              await this.orderService.closeOrder(order); 
          }
      }

      return savedItem;
    }

    const updateItem = await this.itemRepository.update({ transId }, { completedQuantity });
    return updateItem;
  }

  markItemAsCompleted(item: Item) {
    item.preparationStatus = PreparationStatusEnum.Completed;
    return this.itemRepository.save(item);
  }

  create(createItemDto: CreateItemDto) {
    return 'This action adds a new item';
  }

  findAll() {
    return `This action returns all item`;
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}

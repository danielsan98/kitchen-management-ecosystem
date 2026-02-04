import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Repository, Brackets, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity';
import { parseStringPromise } from 'xml2js';
import { formatDatetime } from '../common/helpers/dates.helper';
import { PreparationStatusEnum, PreparationStatusEnumString } from '../common/enums/preparationStatusEnum';
import { QueryOrderDto } from './dto/query-order.dto';
import { BranchService } from '../branch/branch.service';
import { ConfigService } from '@nestjs/config';
import { Branch } from '../branch/entities/branch.entity';
import { getAsycApi } from '../api/asyncApi';
import * as moment from 'moment-timezone';
import { Product } from '../product/entities/product.entity';



export interface SourceOrders {
  admitOne: AdmitOne;
}

export interface AdmitOne {
  orders: Orders;
}

export interface Orders {
  order: OrderInterface[];
}

export interface OrderInterface {
  id: string;
  preparationReference: string;
  datetime: string;
  preparationStatus: string;
  salesChannel: string;
  revision: string;
  orderItems: OrderItems;
  isVIP: boolean; //? Aún no sabemos cómo se llama el campo en la API externa
  customerName: string;
}

export interface OrderItems {
  orderItem: OrderItem[];
}

export interface OrderItem {
  transId: string;
  name: string;
  quantity: string;
  parentId: string;
  itemType: string;
  foodCourse: string;
  preparationStatus: string;
  instructions?: Instructions;
  completedQuantity?: number;
}

export interface Instructions {
  instruction: Instruction;
}

export interface Instruction {
  name: string;
}

export enum OrderStatus {
  "CREATE" = "create",
  "EXIST" = "exist",
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  private MAX_MULTIPROCESSES: number;
  private MINUTS_AGO: number;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly branchService: BranchService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  ) {

    this.MAX_MULTIPROCESSES = this.configService.get('MAX_MULTIPROCESSES', 10);
    this.MINUTS_AGO = this.configService.get('MINUTS_AGO', 10);
  }

  async fetchData(branch: Branch) {
    this.logger.debug(`Procesando: ${branch.hostname}`);
    const { admitOneServer, port, hostname } = branch;
    const url = `http://${admitOneServer}:${port}/getorders?hostname=${hostname}`;
    getAsycApi(url, { branch }, this.syncronizeData.bind(this));
  }


  async syncronizeData(sourceOrders: string, branch: Branch) {
    const { hostname } = branch;
    let orders: OrderInterface[] = [];
    try {

      const parseOrders: SourceOrders = await parseStringPromise(sourceOrders, { explicitArray: false });

      if (parseOrders.admitOne?.orders?.order) {
        if (Array.isArray(parseOrders.admitOne?.orders?.order)) {
          orders = parseOrders.admitOne?.orders?.order;
        } else {
          orders.push(parseOrders.admitOne?.orders?.order);
        }
      }

      if (orders.length === 0 || orders === undefined) {
        this.logger.debug(`No hay ordenes nuevas para la sucursal ${hostname}`);
      }

      this.logger.debug(`Se recibieron ${orders?.length || 0} ordenes para la sucursal ${hostname}`);
      for (let i = 0; i < orders.length; i++) {
        const queryOrderDto: QueryOrderDto = new QueryOrderDto();
        queryOrderDto.id = orders[i].id;
        queryOrderDto.hostname = hostname;
        try {
          const existOrder = await this.getDestinationOrder(queryOrderDto);
          if (existOrder) {
            orders[i].revision = OrderStatus.EXIST;
          } else {
            orders[i].revision = OrderStatus.CREATE;
          }
        } catch (error) {
          this.logger.error(`Error al buscar los pedidos::indice=${i}::${error.message}`);
        }
      }

      try {
        const createOrders: OrderInterface[] = orders ? orders.filter(o => o.revision === OrderStatus.CREATE) : [];
        this.logger.debug(`Total ordenes encontradas: ${orders.length} || Total ordenes por crear: ${createOrders.length}`);

        // this.logger.debug(`Total ordenes encontradas: ${(orders.length - createOrders.length) || 0} || Total ordenes por crear: ${createOrders.length}`);
        if (createOrders.length > 0) {
          await this.createOrders(createOrders, branch);
          //TODO: publicar la modificación de estas ordenes hacia los clientes como un json en texto
          //
        }
      } catch (error) {
        this.logger.error(error.message);
      }

      //! La lógica para sincronizar ódenes completadas ya no será necesarioa

      // try {

      //   const queryOrderDto: QueryOrderDto = new QueryOrderDto();
      //   queryOrderDto.hostname = hostname;
      //   queryOrderDto.minutsAgo = this.MINUTS_AGO; 
      //   queryOrderDto.excludePreparationStatus = 5;




      //   //*Pruebas
      //   // const tmp = orders.filter( o => o.id !== '16946' );
      //   // orders = [...tmp];


      //   const destinationOrders: Order[] = await this.getDestinationOrders(queryOrderDto);
      //   this.logger.debug(`Resultado de getDestinationOrders: ${JSON.stringify(destinationOrders)}`);

      //   const closeOrders: Order[] = [];
      //   for (let i = 0; i < destinationOrders.length; i++) { // Iterar sobre las órdenes existentes
      //     const existingOrder = destinationOrders[i];
      //     const foundOrder = orders.find(o => o.id === existingOrder.id); 

      //     if (!foundOrder && existingOrder.preparationStatus !== PreparationStatusEnum.Completed) { // Si no se encuentra en el arreglo original y no está completada
      //       this.logger.debug(`Orden ${existingOrder.id} no se encuentra en la API, se marcará como completada`);
      //       existingOrder.preparationStatus = PreparationStatusEnum.Completed;
      //       existingOrder.preparationStatusText = PreparationStatusEnumString.Completed;
      //       existingOrder.updatedAt = new Date();
      //       closeOrders.push(existingOrder);
      //     }
      //   }


      //   if (closeOrders.length > 0) {
      //     this.logger.debug(`Cerrando ${closeOrders.length} ordenes de la sucursal ${branch.hostname}`);
      //     await this.closeOrders(closeOrders, branch);
      //   } else {
      //     this.logger.debug(`No hay ordenes por cerrar para la sucursal ${branch.hostname}`);
      //   }


      // } catch (error) {
      //   this.logger.error(`Error al intentar cerrar las ordenes:${error.message}`);
      // }

    } catch (error) {
      this.logger.error(error);
    }
  }

  async closeOrders(orders: Order[], branch: Branch) {
    let requests: Promise<Order>[];
    let count: number = 0;
    let batch: Order[];

    for (let i = 0; i < orders.length; i += this.MAX_MULTIPROCESSES) {
      try {
        batch = orders.slice(i, i + this.MAX_MULTIPROCESSES);
        requests = batch.map(updateOrder => this.orderRepository.save(updateOrder));
        await Promise.all(requests);
        count += requests.length;
      } catch (error) {
        const e = batch.map(o => o.id);
        this.logger.debug(`No se pudiron cerrar las siguientes ordenes ${e.join(',')} de la sucursal ${branch.hostname}`);
      }
    }

    this.logger.debug(`Se cerrarón ${count} ordenes de la sucursal ${branch.hostname}`);
  }

  async createOrders(orders: OrderInterface[], branch: Branch) {

    //* Validación de existencia de nombres de productos en la tabla products

    // recolectar todos los nombres de producto que vienen en las órdenes
    const productNamesSet = new Set<string>();
    for (const order of orders) {
      const items = Array.isArray(order.orderItems.orderItem)
        ? order.orderItems.orderItem
        : [order.orderItems.orderItem];
      for (const it of items) {
        if (it?.name) productNamesSet.add(it.name);
      }
    }
    const productNames = Array.from(productNamesSet);
    if (productNames.length > 0) {
      // buscar los productos existentes
      const existingProducts = await this.productRepository.find({
        where: { productName: In(productNames) },
        select: ['productName'],
      });
      const existingNames = new Set(existingProducts.map(p => p.productName));

      // crear los que faltan con defauls
      const missingNames = productNames.filter(n => !existingNames.has(n));
      if (missingNames.length > 0) {
        const newProducts = missingNames.map(name => {
          const p = new Product();
          p.productName = name;
          p.description = 'AUTO_CREATED';
          p.workZone = 'unknown';
          p.category = 'unknown';
          p.prepTime = 5;
          return p;
        });
        await this.productRepository.save(newProducts);
      }
    }



    const newOrders = orders.map(order => {
      let items = [];
      if (Array.isArray(order.orderItems.orderItem)) {
        items = order.orderItems.orderItem.map(i => {
          const item = new Item();
          item.transId = Number(i.transId);
          item.name = i.name;
          item.quantity = Number(i.quantity);
          item.parentId = Number(i.parentId);
          item.itemType = Number(i.itemType);
          item.preparationStatus = Number(i.preparationStatus);
          item.completedQuantity = Number(i.completedQuantity) || 0;
          // item.foodCourse = i.foodCourse;
          // item.instructions = i.instructions;
          return item;
        });
      } else {
        const { transId, name, quantity, parentId, itemType, preparationStatus } = order.orderItems.orderItem;
        const item = new Item();
        item.transId = Number(transId);
        item.name = name;
        item.quantity = Number(quantity);
        item.parentId = Number(parentId);
        item.itemType = Number(itemType);
        item.preparationStatus = Number(preparationStatus);
        item.completedQuantity = Number(item.completedQuantity) || 0;

        items.push(item);
      }

      const newOrder = new Order();
      newOrder.id = order.id;
      newOrder.preparationReference = order.preparationReference;
      newOrder.dateTime = formatDatetime(order.datetime);
      newOrder.preparationStatus = Number(order.preparationStatus);
      newOrder.salesChannel = Number(order.salesChannel);
      newOrder.orderItems = items;
      newOrder.idConstraint = `${order.id}_${branch.hostname}`
      newOrder.preparationStatusText = PreparationStatusEnumString.BeingPrepared;
      newOrder.customerName = order.customerName || 'Invitado';
      newOrder.branch = branch;
      newOrder.createdAt = new Date();
      newOrder.isVIP = order.isVIP || false;
      // newOrder.revision = order.revision;
      return newOrder;

    });

    let requests: Promise<Order>[];
    for (let i = 0; i < newOrders.length; i += this.MAX_MULTIPROCESSES) {
      const batch = newOrders.slice(i, i + this.MAX_MULTIPROCESSES);
      requests = batch.map(createOrder => this.orderRepository.save(createOrder));
      await Promise.all(requests);
    }

  }

  createOrderQuery(searchOrderDTO: QueryOrderDto) {
    const { id, hostname, minutsAgo, excludePreparationStatus } = searchOrderDTO;
    const qb = this.orderRepository.createQueryBuilder('order');

    if (id) {
      qb.where(`"order"."id" = :id`, { id });
    }

    if (hostname) {
      qb.andWhere(`"order".branch_hostname = :hostname`, { hostname });
    }

    if (minutsAgo) {
      const date = moment().tz('America/Mexico_City').add(-1 * minutsAgo, 'minutes').format('YYYY-MM-DDTHH:mm');
      qb.andWhere(`"order"."dateTime" >= :date`, { date });
    }

    if (excludePreparationStatus) {
      qb.andWhere(`"order".preparation_status < :excludePreparationStatus`, { excludePreparationStatus });
    }

    return qb;
  }

  async getDestinationOrder(searchOrderDTO: QueryOrderDto) {
    const qb = this.createOrderQuery(searchOrderDTO);
    const result = await qb.getOne();
    return result;
  }

  async getDestinationOrders(searchOrderDTO: QueryOrderDto) {
    const qb = this.createOrderQuery(searchOrderDTO);
    const result = await qb.getMany();
    return result;
  }


  async closeOrder(order: Order) {

    const now = new Date();

    order.closedAt = now;

    if (order.dateTime) {
      const start = new Date(order.dateTime); //? Ver si debo usar el dateTime o el createdAt
      const diffInMinutes = now.getTime() - start.getTime();
      order.minutesToReady = Math.floor(diffInMinutes / 60000); // Convertir milisegundos a minutos
    }

    order.preparationStatus = PreparationStatusEnum.Completed;
    order.preparationStatusText = PreparationStatusEnumString.Completed;
    order.updatedAt = now;

    return this.orderRepository.save(order);
  }

  async closeOrderById(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    return this.closeOrder(order);
  }

  async getOrders(queryOrderDto: QueryOrderDto) {
    const { limit, hostname, preparationStatus } = queryOrderDto;
    let page = queryOrderDto.page || 1;
    const offset = (page - 1) * limit;

    try {
      // Validación si existe branch/hostname ya en nuestra BD
      const branch = await this.branchService.findOne(hostname);
      if (!branch) {
        const newBranch = await this.branchService.findOneOrCreate(queryOrderDto);
        this.logger.log(`Branch ${hostname} created: ${JSON.stringify(newBranch)}`);
      }
    } catch (error) {
      this.logger.error(`Error al buscar órdenes pendientes: ${error.message}`)
      throw error;
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);

    let orders, ordersCount;
    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .andWhere('branch.hostname = :hostname', { hostname });

    // Aplica la condición del preparationStatus si está presente
    if (preparationStatus) {
      query.andWhere('order.preparationStatus = :preparationStatus', { preparationStatus });
    } else if (!preparationStatus) {
      query.andWhere('order.preparationStatus < :preparationStatus', { preparationStatus: PreparationStatusEnum.Completed });
    }


    // Aplica la condición del updatedAt
    // query.andWhere(
    //   new Brackets(qb => {
    //     qb.where('order.updatedAt >= :fourMinutesAgo', { fourMinutesAgo })
    //       .orWhere('order.updatedAt IS NULL');
    //   })
    // );

    query.orderBy('order.updatedAt', 'DESC')
      .skip(offset)
      .take(limit);

    [orders, ordersCount] = await query.getManyAndCount();

    const hasNextPage = page * limit < ordersCount;

    return {
      data: orders,
      meta: {
        page,
        limit,
        total: ordersCount
      },
      next: hasNextPage,
      length: orders.length
    };


  }

  async getOrdersByBranch(hostname: string) {

    const currentDay = moment().tz('America/Mexico_City').format('YYYY-MM-DD');

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.branch', 'branch')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .where('branch.hostname = :hostname', { hostname })
      //* Filtro para obtener solo las órdenes del día actual, Desactivado por ahora
      // .andWhere('DATE(order.dateTime) = :currentDay', { currentDay });
      .orderBy('order.updatedAt', 'DESC')
      .getMany();

    return orders;
  }

}
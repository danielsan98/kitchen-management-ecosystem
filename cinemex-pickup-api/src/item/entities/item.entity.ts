import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { PreparationStatusEnum } from '../../common/enums/preparationStatusEnum';
import { Product } from 'src/product/entities/product.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transId: number;

  @Column()
  name: string;

  @ManyToOne(() => Product, product => product.items, { nullable: true })
  @JoinColumn({ name: 'name', referencedColumnName: 'productName' })
  product?: Product;

  @Column()
  quantity: number;

  @Column()
  parentId?: number;

  @Column()
  itemType: number;

  @Column() 
  preparationStatus: PreparationStatusEnum;

  @Column({ default: 0 , nullable: true})
  completedQuantity?: number;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  order: Order;

  

}
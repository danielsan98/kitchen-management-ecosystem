import { Branch } from '../../branch/entities/branch.entity';
import { PreparationStatusEnum } from '../../common/enums/preparationStatusEnum';
import { Item } from '../../item/entities/item.entity';
import { Entity, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()

export class Order {

    @PrimaryColumn()
    id: string;

    @Column({ name: 'preparation_reference' })
    preparationReference: string;

    @Column({ type: 'timestamptz', comment: 'Fecha en UTC' })
    dateTime: Date;

    @Column({ name: 'preparation_status' })
    preparationStatus: PreparationStatusEnum;

    @Column()
    preparationStatusText: string;

    @Column({ nullable: true })
    customerName: string;

    @Column({ nullable: true })
    isVIP: boolean;

    @ManyToOne(() => Branch, (branch) => branch.orders)
    @JoinColumn({ name: 'branch_hostname', referencedColumnName: 'hostname' })
    branch: Branch;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt?: Date

    @Column({ nullable: true })
    closedAt?: Date;

    @Column({ nullable: true })
    minutesToReady?: number;

    @Column({ nullable: true, type: 'int', comment: 'Tiempo promedio esperado en minutos' })
    averagePrepTime?: number;

    @Column({ name: 'sales_channel' })
    salesChannel: number;

    @Column({ unique: true })
    idConstraint: string;

    @OneToMany(() => Item, item => item.order, { cascade: true })
    orderItems: Item[]

}

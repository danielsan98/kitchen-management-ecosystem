import { Client } from "src/clients/entities/client.entity";
import { Order } from "../../order/entities/order.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Branch {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    admitOneServer: string

    @Column()
    port: number

    @Column({ nullable: true })
    user: string

    @Column({ nullable: true })
    password: string

    @Column({ unique: true })
    hostname: string

    @Column()
    timeZone: string

    @OneToMany(() => Order, (order) => order.branch)
    orders: Order[]

    // @Column({ nullable: true, unique: true })
    // branchName: string; 

    @OneToMany(() => Client, client => client.branch)
    clients?: Client[]
}

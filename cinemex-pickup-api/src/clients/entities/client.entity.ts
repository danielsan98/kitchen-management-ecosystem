import { Branch } from "src/branch/entities/branch.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    IP: string;

    @Column({nullable: true})
    netType: string;

    @Column()
    hostname: string;

    @Column()
    lastConnection: Date;

    @Column({nullable: true})
    branchName?: string; 

    // relación con hostname de Branch
    @ManyToOne(() => Branch, branch => branch.clients, { nullable: true })
    @JoinColumn({ name: 'branchName', referencedColumnName: 'hostname' })
    branch?: Branch;

}

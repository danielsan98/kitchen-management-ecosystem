import { Item } from 'src/item/entities/item.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true }) //? Quitar los nombres únicos si se van a repetir
    productName:string; 

    @OneToMany(() => Item, item => item.product)
    items?: Item[];
    
    @Column({ nullable: true })
    description:string;

    @Column()
    workZone:string;

    @Column()
    category:string;

    @Column()
    prepTime:number;

    // @Column({ nullable: true })
    // minPrepTime:number;

    // @Column({ nullable: true })
    // maxPrepTime:number;
}

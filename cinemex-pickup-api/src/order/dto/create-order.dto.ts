import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Item } from "../../item/entities/item.entity";


export class CreateOrderDto {

    @IsNotEmpty()
    @IsString()
    id: string;
    
    @IsNotEmpty()
    @IsString()
    preparationReference: string;
    
    @IsString()
    customerName: string;

    @IsNotEmpty()
    @IsString()
    dateTime: string;

    @IsOptional()
    salesChannel: number;

    @IsString()
    @IsNotEmpty()
    hostname: string;

    @IsArray()
    orderItems: Item[];

    @IsString()
    idConstraint: string

    @IsBoolean()
    isVIP: boolean;
}

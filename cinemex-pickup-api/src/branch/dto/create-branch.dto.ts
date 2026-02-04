import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Order } from '../../order/entities/order.entity';
export class CreateBranchDto {

    @IsNotEmpty()
    @IsString()
    hostname: string;

    @IsString()
    @IsOptional()
    timeZone: string;

    @IsArray()
    @IsOptional()
    orders: Order[];

    @IsString()
    @IsNotEmpty()
    admitOneServer: string;

    @IsString()
    user: string;

    @IsString()
    password: string;
}

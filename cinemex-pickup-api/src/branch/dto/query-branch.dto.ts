import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Order } from "../../order/entities/order.entity";

export class QueryBranchDto {
        @IsNotEmpty()
        @IsString()
        hostname: string;

        @IsString()
        @IsOptional()
        timeZone: string;

        @IsArray()
        @IsOptional()
        orders: Order[];
}
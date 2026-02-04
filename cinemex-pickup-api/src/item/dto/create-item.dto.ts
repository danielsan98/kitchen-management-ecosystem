import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateItemDto {

    @IsNotEmpty()
    transId: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsOptional()
    parentId?: number;

    @IsOptional()
    itemType: number;
    
    preparationStatus: number;

    @IsOptional()
    @IsNumber()
    completedQuantity?: number;
}

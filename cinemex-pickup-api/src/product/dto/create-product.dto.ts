import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    productName: string; //*Relación con item, puede ser id o nombre¿?

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    workZone: string;

    @IsString()
    category: string;

    @IsNumber()
    prepTime: number;

    @IsNumber()
    minPrepTime: number;

    @IsNumber()
    maxPrepTime: number;

}

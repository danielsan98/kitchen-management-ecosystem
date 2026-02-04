import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class QueryOrderDto {
    @IsOptional()
    @IsString()
    preparationReference: string;

    @IsOptional()
    id: string;

    @IsOptional()
    dateTime: Date;

    @IsOptional()
    preparationStatus: number;

    @IsOptional()
    @IsString()
    preparationStatusText: string;

    @IsOptional()
    salesChannel: number;

    // @IsNotEmpty()
    @IsOptional()
    @IsString()
    hostname: string;

    @IsNumber()
    @IsOptional()
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;

    @IsString()
    @IsOptional()
    playerIp: string;

    @IsNumber()
    @IsOptional()
    @IsPositive()
    port: number;

    @IsString()
    @IsOptional()
    playerUser: string;

    @IsString()
    @IsOptional()
    playerPass: string;

    @IsString()
    @IsOptional()
    minutsAgo: number;

    @IsOptional()
    @IsNumber()
    excludePreparationStatus: number;

}
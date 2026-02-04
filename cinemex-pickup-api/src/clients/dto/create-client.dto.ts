import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateClientDto {

    @IsString()
    IP: string;

    @IsString()
    hostname: string; 

    @IsDate()
    lastConnection: Date;

    @IsString()
    @IsOptional()
    branchName: string;
}

import { IsString } from "class-validator";

export class RefreshUserTokenDto {

    @IsString()
    refreshToken: string;

}
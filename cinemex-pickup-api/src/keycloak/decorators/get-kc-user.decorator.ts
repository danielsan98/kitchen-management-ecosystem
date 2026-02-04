import { createParamDecorator, ExecutionContext,  } from "@nestjs/common";
import { KcUser } from "../interfaces/kc-user.interface";

export const GetKcUser = createParamDecorator(
    ( property, ctx: ExecutionContext ) => {
    
        const { user } = ctx.switchToHttp().getRequest();

        return user as KcUser;
    }
)
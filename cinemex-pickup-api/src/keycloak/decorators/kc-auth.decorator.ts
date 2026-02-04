import { applyDecorators,UseGuards } from "@nestjs/common";
import { AuthGuard } from "nest-keycloak-connect";
import { KcRolProtected } from "./kc-rol-protected.decorator";
import { ValidKcRoles } from "../interfaces/kc-valid-roles.interface";
import { KcUserRoleGuard } from "../guard/kc-user-rol.guard";


export function KcAuth(...roles: ValidKcRoles[]) {

    return applyDecorators(
        UseGuards(AuthGuard, 
        KcUserRoleGuard
        ),
        KcRolProtected( ...roles ),
    )
 
}
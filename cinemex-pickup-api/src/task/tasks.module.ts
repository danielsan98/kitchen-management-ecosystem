import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { OrderModule } from "../order/order.module";
import { ScheduleModule } from '@nestjs/schedule'; 
import { BranchModule } from "src/branch/branch.module";
import { ClientsModule } from "src/clients/clients.module";
import { ConfigModule } from "@nestjs/config";


@Module({
    providers: [TasksService],
    imports: [
        ScheduleModule.forRoot(),
        OrderModule,
        BranchModule,
        ClientsModule,
        ConfigModule
    ]
})
export class TasksModule {}
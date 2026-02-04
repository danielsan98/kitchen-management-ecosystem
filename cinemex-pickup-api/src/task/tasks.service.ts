import { Injectable, Logger } from "@nestjs/common";
import { OrderService } from "../order/order.service";
import { Cron, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { Branch } from "src/branch/entities/branch.entity";
import { BranchService } from "src/branch/branch.service";
import { ClientsService } from "src/clients/clients.service";
import { ConfigService } from '@nestjs/config'; 


@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly orderService: OrderService,
        private readonly branchService: BranchService,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly clientService: ClientsService,
        private readonly configService: ConfigService
    ) { }

    async getCrons() {
        const result = [];

        const jobs = this.schedulerRegistry.getCronJobs();
        jobs.forEach((value, key, map) => {
            let next;
            try {
                next = value.nextDate().toJSDate();
            } catch (e) {
                next = 'error: next fire date is in the past!';
            }

            result.push({
                name: key,
                next: next,
                status: value.isActive,
                cronTime: value.cronTime.source
            });
        });

        return result;
    }

    // Este método se ejecuta una vez, 2 segundos después del inicio de la API

    @Timeout('SyncProcces', 1000)
    async syncProcces() {
        try {
            const branches: Branch[] = await this.branchService.findAll();

            for (const branch of branches) {
                try {
                    await this.orderService.fetchData(branch);
                } catch (error) {
                    this.logger.error(`Error al realizar la comparacion de datos. ${error.message}`);
                }
            }


        } catch (error) {
            this.logger.error(`Error al obtener los nombres de Hosts:`, error);
        }

    }

    @Cron('*/1 * * * *', {
        name: 'TriggerSyncProcces'
    })
    async triggerSyncProcces() {
        this.syncProcces();
    }

    @Cron('*/1 * * * *', {
        name: 'TriggerFetchOrdersByBranch'
    })
    async triggerFetchOrdersByBranch() {

        const branches = await this.branchService.findAll();
        const io = require("socket.io-client");
        const SOCKET_PORT = this.configService.get<number>('SOCKET_PORT', 5101); 
        

        for (const branch of branches) {
            const hostname = branch.hostname;

            const orders = await this.orderService.getOrdersByBranch(hostname);

            // traigo clientes que pertenezcan al branchName
            const clients = await this.clientService.findByBranchName(branch.hostname);

            for (const client of clients) {

                const clientIP = client.IP;
                const socketUrl = `http://${clientIP}:${SOCKET_PORT}`;

                this.logger.log(`Conectando al socket server en ${socketUrl} para el cliente ${client.hostname}...`);
                const socket = io(socketUrl, {
                    forceNew: true,
                    reconnectionAttempts: 3,
                    timeout: 5000,
                });

                try {
                    await new Promise((resolve, reject) => {
                        socket.on('connect', () => {
                            resolve(true);
                        });

                        socket.on('connect_error', (error) => {
                            reject(new Error(`Error de conexión al socket server en ${socketUrl}: ${error.message}`));
                        });
                    });

                    socket.emit('orders-update', {
                        hostname: client.hostname,
                        branchName: client.branchName,
                        orders: orders
                    })

                    this.logger.log(`Órdenes enviadas al cliente ${client.hostname} para la sucursal ${client.branchName}`);

                } catch (error) {
                    this.logger.error(`No se pudo conectar al socket server en ${socketUrl} para el cliente ${client.hostname}: ${error.message}`);
                } finally {
                    socket.disconnect();
                }

                //validar conexion exitosa
                if (socket.connected) {
                    this.logger.log(`Órdenes enviadas al cliente ${client.hostname} para la sucursal ${client.branchName}`);
                }

            }

        }

        

    }


}
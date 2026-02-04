import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import * as ping from 'ping';

export interface OsInfo {
  hostname: string;
  IPs: { family: string; ip: string }[];
  branchName?: string;
  netType?: string;
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) { }

  async getClients() {
    const clients = await this.clientRepository.find();
    return clients;
  }

  async registerClient(osInfo: OsInfo) {
    try {
      const { hostname, IPs, branchName, netType } = osInfo;

      // Iterar sobre las IPs y hacer ping
      for (const ipInfo of IPs) {
        const res = await ping.promise.probe(ipInfo.ip);
        if (res.alive) {
          console.log(`Conexión exitosa a ${ipInfo.ip}`);

          // Verificar si el cliente ya existe
          const existingClients = await this.clientRepository.createQueryBuilder('client')
            .where('client.hostname = :hostname', { hostname })
            .getMany();

          if (existingClients.length > 0) {
            const client = existingClients[0];
            client.lastConnection = new Date();
            client.IP = ipInfo.ip;
            client.netType = ipInfo.family;
            client.branchName = branchName; // Actualizamos la sucursal por si cambió

            await this.clientRepository.save(client);
            console.log(`Cliente ${hostname} actualizado con sucursal ${branchName}.`);
            return client;
          } else {
            // Crear nuevo cliente
            const newClient = this.clientRepository.create({
              hostname,
              lastConnection: new Date(),
              IP: ipInfo.ip,
              netType: ipInfo.family,
              branchName: branchName,
            });
            return this.clientRepository.save(newClient);
          }
        }
      }

      throw new Error('No se pudo establecer conexión con ninguna de las IPs proporcionadas.');
    } catch (error) {
      throw new Error(`Error al registrar el cliente: ${error.message}`);
    }
  }


  async findByBranchName(branchName: string): Promise<Client[]> {
    return this.clientRepository.find({ where: { branchName } });
  }

  create(createClientDto: CreateClientDto) {
    return 'This action adds a new client';
  }

  findAll() {
    return `This action returns all clients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}

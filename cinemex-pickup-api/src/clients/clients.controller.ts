import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientsService, OsInfo } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { KcAuth } from 'src/keycloak/decorators/kc-auth.decorator';
import { ValidKcRoles } from 'src/keycloak/interfaces/kc-valid-roles.interface';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('getClients')
  getClients() {
    return this.clientsService.getClients();
  }

  @Post('registerClient')
  // @KcAuth( ValidKcRoles.user )
  registerClient(@Body() osInfo: OsInfo) {
    return this.clientsService.registerClient(osInfo);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}

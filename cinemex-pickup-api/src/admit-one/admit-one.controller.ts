import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdmitOneService } from './admit-one.service';
import { CreateAdmitOneDto } from './dto/create-admit-one.dto';
import { UpdateAdmitOneDto } from './dto/update-admit-one.dto';

@Controller('admit-one')
export class AdmitOneController {
  constructor(private readonly admitOneService: AdmitOneService) {}

  @Post()
  create(@Body() createAdmitOneDto: CreateAdmitOneDto) {
    return this.admitOneService.create(createAdmitOneDto);
  }

  @Get()
  findAll() {
    return this.admitOneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.admitOneService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdmitOneDto: UpdateAdmitOneDto) {
    return this.admitOneService.update(+id, updateAdmitOneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admitOneService.remove(+id);
  }
}

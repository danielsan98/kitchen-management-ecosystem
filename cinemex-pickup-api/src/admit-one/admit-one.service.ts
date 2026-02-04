import { Injectable } from '@nestjs/common';
import { CreateAdmitOneDto } from './dto/create-admit-one.dto';
import { UpdateAdmitOneDto } from './dto/update-admit-one.dto';

@Injectable()
export class AdmitOneService {
  create(createAdmitOneDto: CreateAdmitOneDto) {
    return 'This action adds a new admitOne';
  }

  findAll() {
    return `This action returns all admitOne`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admitOne`;
  }

  update(id: number, updateAdmitOneDto: UpdateAdmitOneDto) {
    return `This action updates a #${id} admitOne`;
  }

  remove(id: number) {
    return `This action removes a #${id} admitOne`;
  }
}

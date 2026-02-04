import { PartialType } from '@nestjs/mapped-types';
import { CreateAdmitOneDto } from './create-admit-one.dto';

export class UpdateAdmitOneDto extends PartialType(CreateAdmitOneDto) {}

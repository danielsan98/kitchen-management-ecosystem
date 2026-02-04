import { Injectable, Logger } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryOrderDto } from 'src/order/dto/query-order.dto';
import { hostname } from 'os';


@Injectable()
export class BranchService {

  private readonly logger = new Logger(BranchService.name)

  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) { }

  async create(createBranchDto: CreateBranchDto) {
    try {
      const newBranch = await this.branchRepository.create(createBranchDto);

      if (createBranchDto.orders) {
        newBranch.orders = createBranchDto.orders;
      }

      if (createBranchDto.timeZone) {
        newBranch.timeZone = createBranchDto.timeZone;
      } else {
        newBranch.timeZone = 'America/Mexico_City';
      }

      await this.branchRepository.save(newBranch);

      return newBranch;
    } catch (error) {
      this.logger.error(`Error en la creación de sucursal: ${error.message}`)
    }

  }

  async branchExists(hostname: string) {
    try {
      const branch = await this.branchRepository.findOne({ where: { hostname } });
      return branch;
    } catch (error) {
      this.logger.error(`Error en la busqueda de sucursal: ${error.message}`)
    }
  }

  async findOneOrCreate(queryOrderDto: QueryOrderDto, timeZone?: string) {
    try {
      const branch = await this.branchRepository.findOne({ where: { hostname: queryOrderDto.hostname } });
      if (branch) {
        return branch;
      }

      if (!timeZone) {
        timeZone = 'America/Mexico_City';
      }

      return this.branchRepository.save({
        admitOneServer: queryOrderDto.playerIp,
        port: queryOrderDto.port,
        user: queryOrderDto.playerUser,
        password: queryOrderDto.playerPass,
        hostname: queryOrderDto.hostname,
        timeZone: timeZone
      });

    } catch (error) {
      this.logger.error(`Error en la busqueda de sucursal: ${error.message}`)
    }
  }

  async findAll() {
    const branches = await this.branchRepository.find();
    return branches;
  }

  async findOne(term: string) {
    let branch: Branch;
    let where: FindOptionsWhere<Branch> = {};

    let search: string | number = !isNaN(Number(term)) ? Number(term) : term;

    if (typeof search === 'number') {
      where = {
        id: search
      }
    } else if (typeof search === 'string') {
      where = {
        hostname: search
      }
    }

    try {
      branch = await this.branchRepository.findOneBy(where);
      return branch;
    } catch (error) {
      this.logger.error(`Error en la busqueda de sucursal: ${error.message}`)
    }

  }

  async update(hostname: string, updateBranchDto: UpdateBranchDto) {
    let branch: Branch = await this.findOne(hostname);
    branch = Object.assign(branch, updateBranchDto);
    return await this.branchRepository.save(branch);
  }

  async remove(hostname: string) {
    try {
      const branch: Branch = await this.findOne(hostname);
      return this.branchRepository.remove(branch);
    } catch (error) {
      this.logger.error(`Error en la eliminación de sucursal: ${error.message}`)
    }

  }
}

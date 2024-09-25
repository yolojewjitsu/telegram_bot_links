import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import * as crypto from 'crypto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepository: Repository<Link>,
  ) {}

  async create(createLinkDto: CreateLinkDto, userId: string): Promise<Link> {
    const code = crypto.randomBytes(4).toString('hex');
    const link = this.linkRepository.create({
      ...createLinkDto,
      code,
      userId,
    });
    return this.linkRepository.save(link);
  }

  async findAll(userId: string, page: number = 1, limit: number = 10): Promise<[Link[], number]> {
    return this.linkRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(code: string): Promise<Link> {
    const link = await this.linkRepository.findOne({ where: { code } });
    if (!link) {
      throw new NotFoundException(`Link with code ${code} not found`);
    }
    return link;
  }

  async findByName(name: string, userId: string): Promise<Link | undefined> {
    return this.linkRepository.findOne({ where: { name, userId } });
  }

  async findByUrl(url: string, userId: string): Promise<Link | undefined> {
    return this.linkRepository.findOne({ where: { url, userId } });
  }

  async remove(code: string, userId: string): Promise<void> {
    const result = await this.linkRepository.delete({ code, userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Link with code ${code} not found or does not belong to the user`);
    }
  }

  async removeByCodeOrName(query: string, userId: string): Promise<boolean> {
    const link = await this.linkRepository.findOne({
      where: [
        { code: query, userId },
        { name: query, userId }
      ]
    });

    if (!link) {
      return false;
    }

    await this.linkRepository.remove(link);
    return true;
  }
}
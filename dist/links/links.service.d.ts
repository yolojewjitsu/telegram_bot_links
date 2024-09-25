import { Repository } from 'typeorm';
import { Link } from './entities/link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
export declare class LinksService {
    private linkRepository;
    constructor(linkRepository: Repository<Link>);
    create(createLinkDto: CreateLinkDto, userId: string): Promise<Link>;
    findAll(userId: string, page?: number, limit?: number): Promise<[Link[], number]>;
    findOne(code: string): Promise<Link>;
    findByName(name: string, userId: string): Promise<Link | undefined>;
    findByUrl(url: string, userId: string): Promise<Link | undefined>;
    remove(code: string, userId: string): Promise<void>;
    removeByCodeOrName(query: string, userId: string): Promise<boolean>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const link_entity_1 = require("./entities/link.entity");
const crypto = require("crypto");
let LinksService = class LinksService {
    constructor(linkRepository) {
        this.linkRepository = linkRepository;
    }
    async create(createLinkDto, userId) {
        const code = crypto.randomBytes(4).toString('hex');
        const link = this.linkRepository.create({
            ...createLinkDto,
            code,
            userId,
        });
        return this.linkRepository.save(link);
    }
    async findAll(userId, page = 1, limit = 10) {
        return this.linkRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async findOne(code) {
        const link = await this.linkRepository.findOne({ where: { code } });
        if (!link) {
            throw new common_1.NotFoundException(`Link with code ${code} not found`);
        }
        return link;
    }
    async findByName(name, userId) {
        return this.linkRepository.findOne({ where: { name, userId } });
    }
    async findByUrl(url, userId) {
        return this.linkRepository.findOne({ where: { url, userId } });
    }
    async remove(code, userId) {
        const result = await this.linkRepository.delete({ code, userId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Link with code ${code} not found or does not belong to the user`);
        }
    }
    async removeByCodeOrName(query, userId) {
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
};
exports.LinksService = LinksService;
exports.LinksService = LinksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(link_entity_1.Link)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LinksService);
//# sourceMappingURL=links.service.js.map
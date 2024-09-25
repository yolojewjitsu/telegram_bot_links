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
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const links_service_1 = require("../links/links.service");
let BotService = class BotService {
    constructor(bot, linksService) {
        this.bot = bot;
        this.linksService = linksService;
    }
    getHelpMessage() {
        return 'Команды:\n' +
            '/save <url> <name> - сохранить ссылку\n' +
            '/list - список сохраненных ссылок\n' +
            '/delete <code или name> - удалить ссылку\n' +
            '/get <code или name> - получить ссылку по коду или имени';
    }
    async handleStart(ctx) {
        await this.safeReply(ctx, 'Добро пожаловать! ' + this.getHelpMessage());
    }
    async handleHelp(ctx) {
        await this.safeReply(ctx, this.getHelpMessage());
    }
    async handleSave(ctx, args) {
        if (args.length < 2) {
            await this.safeReply(ctx, 'Использование: /save <url> <name>');
            return;
        }
        let [url, ...nameArray] = args;
        const name = nameArray.join(' ');
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        try {
            const urlObject = new URL(url);
            if (!urlObject.hostname.includes('.') || urlObject.hostname.split('.').some(part => part.length === 0)) {
                await this.safeReply(ctx, 'Неверный формат URL. Убедитесь, что вы ввели полный домен.');
                return;
            }
        }
        catch (error) {
            await this.safeReply(ctx, 'Неверный формат URL. Убедитесь, что вы ввели полный домен.');
            return;
        }
        const userId = ctx.from?.id.toString();
        if (!userId) {
            await this.safeReply(ctx, 'Произошла ошибка при идентификации пользователя.');
            return;
        }
        try {
            const existingLinkByUrl = await this.linksService.findByUrl(url, userId);
            if (existingLinkByUrl) {
                await this.safeReply(ctx, `Эта ссылка уже сохранена с именем "${existingLinkByUrl.name}".`);
                return;
            }
            const existingLinkByName = await this.linksService.findByName(name, userId);
            if (existingLinkByName) {
                await this.safeReply(ctx, 'Ссылка с таким именем уже существует. Пожалуйста, выберите другое имя.');
                return;
            }
            const createLinkDto = { url, name };
            const link = await this.linksService.create(createLinkDto, userId);
            await this.safeReply(ctx, `Ссылка сохранена. Код: ${link.code}`);
        }
        catch (error) {
            await this.safeReply(ctx, 'Произошла ошибка при сохранении ссылки. Пожалуйста, попробуйте еще раз.');
        }
    }
    async handleList(ctx) {
        const userId = ctx.from?.id.toString();
        if (!userId) {
            await this.safeReply(ctx, 'Произошла ошибка при идентификации пользователя.');
            return;
        }
        try {
            const [links, total] = await this.linksService.findAll(userId);
            if (links.length === 0) {
                await this.safeReply(ctx, 'У вас нет сохраненных ссылок.');
                return;
            }
            const message = links.map(link => `${link.name}: ${link.code}`).join('\n');
            await this.safeReply(ctx, `Ваши ссылки:\n${message}`);
        }
        catch (error) {
            await this.safeReply(ctx, 'Произошла ошибка при получении списка ссылок.');
        }
    }
    async handleDelete(ctx, args) {
        if (args.length !== 1) {
            await this.safeReply(ctx, 'Использование: /delete <code или name>');
            return;
        }
        const [query] = args;
        const userId = ctx.from?.id.toString();
        if (!userId) {
            await this.safeReply(ctx, 'Произошла ошибка при идентификации пользователя.');
            return;
        }
        try {
            const result = await this.linksService.removeByCodeOrName(query, userId);
            if (result) {
                await this.safeReply(ctx, 'Ссылка успешно удалена.');
            }
            else {
                await this.safeReply(ctx, 'Ссылка не найдена или у вас нет прав на её удаление.');
            }
        }
        catch (error) {
            await this.safeReply(ctx, 'Произошла ошибка при удалении ссылки.');
        }
    }
    async handleGet(ctx, args) {
        if (args.length !== 1) {
            await this.safeReply(ctx, 'Использование: /get <code или name>');
            return;
        }
        const [query] = args;
        const userId = ctx.from?.id.toString();
        if (!userId) {
            await this.safeReply(ctx, 'Произошла ошибка при идентификации пользователя.');
            return;
        }
        try {
            let link = await this.linksService.findOne(query);
            if (!link) {
                link = await this.linksService.findByName(query, userId);
            }
            if (link) {
                await this.safeReply(ctx, `Ссылка: ${link.url}\nИмя: ${link.name}\nКод: ${link.code}`);
            }
            else {
                await this.safeReply(ctx, 'Ссылка не найдена.');
            }
        }
        catch (error) {
            await this.safeReply(ctx, 'Произошла ошибка при получении ссылки.');
        }
    }
    async safeReply(ctx, message) {
        console.log('Попытка отправки сообщения:', message);
        try {
            await ctx.reply(message);
            console.log('Сообщение успешно отправлено');
        }
        catch (error) {
            console.error('Ошибка при отправке через ctx.reply:', error);
            try {
                await ctx.telegram.sendMessage(ctx.chat.id, message);
                console.log('Сообщение отправлено через ctx.telegram.sendMessage');
            }
            catch (telegramError) {
                console.error('Ошибка при отправке через ctx.telegram.sendMessage:', telegramError);
            }
        }
    }
};
exports.BotService = BotService;
exports.BotService = BotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        links_service_1.LinksService])
], BotService);
//# sourceMappingURL=bot.service.js.map
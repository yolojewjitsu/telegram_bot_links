import { Context, Telegraf } from 'telegraf';
import { LinksService } from '../links/links.service';
export declare class BotService {
    private bot;
    private readonly linksService;
    constructor(bot: Telegraf<Context>, linksService: LinksService);
    private getHelpMessage;
    handleStart(ctx: Context): Promise<void>;
    handleHelp(ctx: Context): Promise<void>;
    handleSave(ctx: Context, args: string[]): Promise<void>;
    handleList(ctx: Context): Promise<void>;
    handleDelete(ctx: Context, args: string[]): Promise<void>;
    handleGet(ctx: Context, args: string[]): Promise<void>;
    private safeReply;
}

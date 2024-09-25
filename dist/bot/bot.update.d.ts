import { Context } from 'telegraf';
import { BotService } from './bot.service';
export declare class BotUpdate {
    private readonly botService;
    constructor(botService: BotService);
    start(ctx: Context): Promise<void>;
    help(ctx: Context): Promise<void>;
    handleText(ctx: Context): Promise<void>;
}

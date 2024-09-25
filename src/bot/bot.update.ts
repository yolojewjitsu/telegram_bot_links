import { Update, Ctx, Start, Help, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    return this.botService.handleStart(ctx);
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    return this.botService.handleHelp(ctx);
  }

  @On('text')
  async handleText(@Ctx() ctx: Context) {
    const text = ctx.message['text'];
    const [command, ...args] = text.split(' ');

    switch (command) {
      case '/save':
        return this.botService.handleSave(ctx, args);
      case '/list':
        return this.botService.handleList(ctx);
      case '/delete':
        return this.botService.handleDelete(ctx, args);
      case '/get':
        return this.botService.handleGet(ctx, args);
      default:
        await ctx.reply('Неизвестная команда. Используйте /help для списка команд.');
    }
  }
}
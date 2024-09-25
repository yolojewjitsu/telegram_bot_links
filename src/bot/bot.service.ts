import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { LinksService } from '../links/links.service';
import { CreateLinkDto } from '../links/dto/create-link.dto';

@Injectable()
export class BotService {
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    private readonly linksService: LinksService
  ) {}

  private getHelpMessage(): string {
    return 'Команды:\n' +
      '/save <url> <name> - сохранить ссылку\n' +
      '/list - список сохраненных ссылок\n' +
      '/delete <code или name> - удалить ссылку\n' +
      '/get <code или name> - получить ссылку по коду или имени';
  }

  async handleStart(ctx: Context) {
    await this.safeReply(ctx, 'Добро пожаловать! ' + this.getHelpMessage());
  }

  async handleHelp(ctx: Context) {
    await this.safeReply(ctx, this.getHelpMessage());
  }

  async handleSave(ctx: Context, args: string[]) {
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
    } catch (error) {
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
  
      const createLinkDto: CreateLinkDto = { url, name };
      const link = await this.linksService.create(createLinkDto, userId);
      await this.safeReply(ctx, `Ссылка сохранена. Код: ${link.code}`);
    } catch (error) {
      await this.safeReply(ctx, 'Произошла ошибка при сохранении ссылки. Пожалуйста, попробуйте еще раз.');
    }
  }

  async handleList(ctx: Context) {
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
    } catch (error) {
      await this.safeReply(ctx, 'Произошла ошибка при получении списка ссылок.');
    }
  }

  async handleDelete(ctx: Context, args: string[]) {
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
      } else {
        await this.safeReply(ctx, 'Ссылка не найдена или у вас нет прав на её удаление.');
      }
    } catch (error) {
      await this.safeReply(ctx, 'Произошла ошибка при удалении ссылки.');
    }
  }

  async handleGet(ctx: Context, args: string[]) {
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
      } else {
        await this.safeReply(ctx, 'Ссылка не найдена.');
      }
    } catch (error) {
      await this.safeReply(ctx, 'Произошла ошибка при получении ссылки.');
    }
  }

  private async safeReply(ctx: Context, message: string) {
    console.log('Попытка отправки сообщения:', message);
    try {
      await ctx.reply(message);
      console.log('Сообщение успешно отправлено');
    } catch (error) {
      console.error('Ошибка при отправке через ctx.reply:', error);
      try {
        await ctx.telegram.sendMessage(ctx.chat.id, message);
        console.log('Сообщение отправлено через ctx.telegram.sendMessage');
      } catch (telegramError) {
        console.error('Ошибка при отправке через ctx.telegram.sendMessage:', telegramError);
      }
    }
  }
}
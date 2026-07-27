// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';

export class ShipHistoryCommand extends BaseCommand {
  constructor() {
    super({ name: 'shiphistory', description: 'View the ship/couple history between two members 📖', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['couplehistory2', 'lovehistory'], examples: ['/shiphistory @user1 @user2', 'p!shiphistory @user1 @user2'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
      .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId1: string, userId2: string, guildId: string, send: (content: any) => Promise<any>): Promise<void> {
    const history = await coupleHistoryService.getHistory(userId1, userId2, guildId).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('📖 Ship History')
      .setColor(0xff69b4)
      .setTimestamp();

    if (!history || (history as any[]).length === 0) {
      embed.setDescription(`💔 No recorded history between <@${userId1}> and <@${userId2}>.`);
    } else {
      const entries = (history as any[]).slice(0, 10).map((h: any) => {
        const ts = Math.floor(new Date(h.createdAt).getTime() / 1000);
        const action = h.event === 'married' ? '💒 Got together' : h.event === 'divorced' ? '💔 Separated' : `📝 ${h.event}`;
        return `${action} — <t:${ts}:D>`;
      });
      embed.setDescription(`**Ship: <@${userId1}> ❤️ <@${userId2}>**\n\n${entries.join('\n')}`);
    }

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const u1 = i.options.getUser('user1', true);
    const u2 = i.options.getUser('user2') || i.user;
    await this.handle(u1.id, u2.id, i.guildId!, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const users = m.mentions.users;
    const u1 = users.first() || m.author;
    const u2 = users.size >= 2 ? users.at(1)! : m.author;
    await this.handle(u1.id, u2.id, m.guildId!, (c) => m.reply(c));
  }
}
export default ShipHistoryCommand;

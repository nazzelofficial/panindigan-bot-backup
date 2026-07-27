// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class LovemeterCommand extends BaseCommand {
  constructor() {
    super({ name: 'lovemeter', description: 'Measure the love compatibility between two members 💘', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['lovecalc', 'lovecheck'], examples: ['/lovemeter @user1 @user2', 'p!lovemeter @user1 @user2'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user1').setDescription('First person').setRequired(true))
      .addUserOption(o => o.setName('user2').setDescription('Second person').setRequired(false))) as SlashCommandBuilder;
  }

  private calculate(id1: string, id2: string): number {
    const combined = (BigInt(id1) + BigInt(id2)).toString();
    let hash = 0;
    for (const c of combined) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return Math.abs(hash % 101);
  }

  private getMessage(pct: number): string {
    if (pct >= 90) return '💞 Perfect match! You two are soulmates! 🥰';
    if (pct >= 75) return '💕 Strong connection! Malakas ang chemistry!';
    if (pct >= 60) return '💗 Good compatibility! May potential ito! 😊';
    if (pct >= 45) return '💛 Moderate compatibility. Give it time! ⏰';
    if (pct >= 30) return '🤍 Low compatibility. Pero love is unpredictable! 🤷';
    return '💔 Hmm… not the best match. Pero who knows? 🙈';
  }

  private buildEmbed(user1: string, user2: string, pct: number): EmbedBuilder {
    const filled = Math.round(pct / 10);
    const bar = '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);
    return new EmbedBuilder()
      .setTitle('💘 Love Meter')
      .setDescription(`**${user1}** ❤️ **${user2}**\n\n${bar}\n\n**${pct}%** compatibility\n\n${this.getMessage(pct)}`)
      .setColor(0xff69b4)
      .setFooter({ text: 'Panindigan Social • For entertainment only' });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const u1 = i.options.getUser('user1', true);
    const u2 = i.options.getUser('user2') || i.user;
    const pct = this.calculate(u1.id, u2.id);
    await i.reply({ embeds: [this.buildEmbed(u1.username, u2.username, pct)] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const users = m.mentions.users;
    const u1 = users.first() || m.author;
    const u2 = users.size >= 2 ? users.at(1)! : m.author;
    const pct = this.calculate(u1.id, u2.id);
    await m.reply({ embeds: [this.buildEmbed(u1.username, u2.username, pct)] });
  }
}
export default LovemeterCommand;

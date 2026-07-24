import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif','https://media.giphy.com/media/doUu2ByZa8dSKEMEBB/giphy.gif'];
export class HighFiveCommand extends BaseCommand {
  constructor() { super({ name: 'highfive', description: 'Give someone a high five! ✋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['hi5'], examples: ['/highfive @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to high five').setRequired(true))) as SlashCommandBuilder; }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`✋ **${i.user.username}** high fives **${t.username}**!`).setImage(this.gif()).setColor(COLORS.success)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`✋ **${m.author.username}** high fives **${t.username}**!`).setImage(this.gif()).setColor(COLORS.success)] }); }
}
export default HighFiveCommand;

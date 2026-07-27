// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = ['https://media.giphy.com/media/l0NwvUCbBxpNXag0g/giphy.gif'];
export class WaveCommand extends BaseCommand {
  constructor() { super({ name: 'wave', description: 'Wave at someone! 👋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['hi'], examples: ['/wave @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to wave at').setRequired(true))) as SlashCommandBuilder; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`👋 **${i.user.username}** waves at **${t.username}**!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`👋 **${m.author.username}** waves at **${t.username}**!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default WaveCommand;

// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = ['https://media.giphy.com/media/sM4ALgVCMeiJq/giphy.gif','https://media.giphy.com/media/zMzgLkXJFYWNa/giphy.gif'];
export class BiteCommand extends BaseCommand {
  constructor() { super({ name: 'bite', description: 'Bite someone! 🦷', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['chomp'], examples: ['/bite @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to bite').setRequired(true))) as SlashCommandBuilder; }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`🦷 **${i.user.username}** bites **${t.username}**!`).setImage(this.gif()).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`🦷 **${m.author.username}** bites **${t.username}**!`).setImage(this.gif()).setColor(COLORS.default)] }); }
}
export default BiteCommand;

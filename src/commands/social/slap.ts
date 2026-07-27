// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = ['https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif','https://media.giphy.com/media/jLeyZWgtwgr2U/giphy.gif','https://media.giphy.com/media/uqSU9IEYEKAbS/giphy.gif'];

export class SlapCommand extends BaseCommand {
  constructor() { super({ name: 'slap', description: 'Slap someone! 👋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['smack'], examples: ['/slap @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to slap').setRequired(true))) as SlashCommandBuilder; }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`👋 **${i.user.username}** slaps **${t.username}**!`).setImage(this.gif()).setColor(COLORS.error)] }); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`👋 **${m.author.username}** slaps **${t.username}**!`).setImage(this.gif()).setColor(COLORS.error)] }); }
}
export default SlapCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/5tmRHwTlHAA9WkX6Sg/giphy.gif',
  'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
  'https://media.giphy.com/media/N0CIxcyPLROZa/giphy.gif',
];

export class PatCommand extends BaseCommand {
  constructor() {
    super({ name: 'pat', description: 'Gently pat someone on the head! 👋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['headpat', 'petpat'], examples: ['/pat @user', 'p!pat @user'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to pat').setRequired(true))) as SlashCommandBuilder;
  }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user', true);
    const embed = new EmbedBuilder().setDescription(`✋ **${i.user.username}** pats **${t.username}** on the head!`).setImage(this.gif()).setColor(COLORS.default);
    await i.reply({ embeds: [embed] });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone to pat!'); return; }
    const embed = new EmbedBuilder().setDescription(`✋ **${m.author.username}** pats **${t.username}** on the head!`).setImage(this.gif()).setColor(COLORS.default);
    await m.reply({ embeds: [embed] });
  }
}
export default PatCommand;

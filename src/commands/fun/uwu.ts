// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, errorEmbed } from '../../utils/EmbedSystem.js';

export class UwuCommand extends BaseCommand {
  constructor() {
    super({
      name: 'uwu', description: 'UwUify any text OwO', category: 'fun',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['owo', 'uwuify'], examples: ['/uwu Hello world', 'p!uwu I love cats'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to UwUify').setRequired(true)) as SlashCommandBuilder;
  }

  private uwuify(text: string): string {
    const faces = ['(・`ω´・)', ';;w;;', 'owo', 'UwU', '>w<', '^w^'];
    return text
      .replace(/[rl]/gi, 'w')
      .replace(/th/gi, 'd')
      .replace(/n([aeiou])/gi, 'ny$1')
      .replace(/!+/g, () => ` ${faces[Math.floor(Math.random() * faces.length)]}!`)
      .replace(/\./g, ' uwu.')
      .replace(/,/g, ' owo,');
  }

  private build(original: string, uwued: string, user: any): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(PALETTE.fun ?? 0xFF6B6B)
      .setAuthor({ name: `${user.username} UwU'd`, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setDescription(`UwU *${uwued}*`)
      .setFooter({ text: `Original: ${original.slice(0, 80)}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    await interaction.reply({ embeds: [this.build(text, this.uwuify(text), interaction.user)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const text = args.join(' ');
    if (!text) return void message.reply({ embeds: [errorEmbed('No Text', 'Provide text to UwUify!')] });
    await message.reply({ embeds: [this.build(text, this.uwuify(text), message.author)] });
  }
}
export default UwuCommand;

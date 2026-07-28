// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, errorEmbed } from '../../utils/EmbedSystem.js';

export class MockCommand extends BaseCommand {
  constructor() {
    super({
      name: 'mock', description: 'MoCk SoMeOnE\'s TeXt', category: 'fun',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['spongebob'], examples: ['/mock hello world', 'p!mock I am the best'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to mock').setRequired(true)) as SlashCommandBuilder;
  }

  private mockify(text: string): string {
    return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
  }

  private build(original: string, mocked: string, user: any): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(PALETTE.warning)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setDescription(`🧽 ${mocked}`)
      .setFooter({ text: `Original: ${original.slice(0, 80)}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    await interaction.reply({ embeds: [this.build(text, this.mockify(text), interaction.user)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const text = args.join(' ');
    if (!text) return void message.reply({ embeds: [errorEmbed('No Text', 'Provide text to mock!')] });
    await message.reply({ embeds: [this.build(text, this.mockify(text), message.author)] });
  }
}
export default MockCommand;

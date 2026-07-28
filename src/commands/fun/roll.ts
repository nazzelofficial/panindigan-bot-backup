// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, errorEmbed } from '../../utils/EmbedSystem.js';

export class RollCommand extends BaseCommand {
  constructor() {
    super({
      name: 'roll', description: 'Roll a dice (e.g. 2d6, 1d20)', category: 'fun',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['dice', 'rolldice'], examples: ['/roll 2d6', '/roll 1d20', 'p!roll 3d8'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('dice').setDescription('Dice notation (e.g. 2d6, 1d20, d100)').setRequired(false)) as SlashCommandBuilder;
  }

  private parse(input: string): { rolls: number; sides: number } | null {
    const m = input.toLowerCase().match(/^(\d*)d(\d+)$/);
    if (!m) return null;
    const rolls = parseInt(m[1] || '1');
    const sides = parseInt(m[2]);
    if (rolls < 1 || rolls > 100 || sides < 2 || sides > 1000) return null;
    return { rolls, sides };
  }

  private build(notation: string, results: number[], user: any): EmbedBuilder {
    const sum = results.reduce((a, b) => a + b, 0);
    const max = results.length * parseInt(notation.split('d')[1]);
    const isMax = sum === max;
    const isMin = sum === results.length;

    return new EmbedBuilder()
      .setColor(isMax ? PALETTE.success : isMin ? PALETTE.error : PALETTE.fun ?? PALETTE.primary)
      .setAuthor({ name: `${user.username} rolled ${notation}`, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setDescription(
        results.length > 1
          ? `🎲 Results: ${results.map(r => `\`${r}\``).join(' + ')} = **${sum}**${isMax ? ' 🎉 MAXIMUM!' : isMin ? ' 💀 MINIMUM!' : ''}`
          : `🎲 Rolled: **${sum}**${isMax ? ' 🎉 MAXIMUM!' : isMin ? ' 💀 MINIMUM!' : ''}`,
      )
      .setFooter({ text: `${notation.toUpperCase()}  •  Range: ${results.length}–${max}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const notation = interaction.options.getString('dice') ?? '1d6';
    const parsed = this.parse(notation);
    if (!parsed) return void interaction.reply({ embeds: [errorEmbed('Invalid Dice', 'Use dice notation like `2d6`, `1d20`, `d100`. Max 100 dice with up to 1000 sides.')], ephemeral: true });
    const results = Array.from({ length: parsed.rolls }, () => Math.floor(Math.random() * parsed.sides) + 1);
    await interaction.reply({ embeds: [this.build(notation, results, interaction.user)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const notation = args[0] ?? '1d6';
    const parsed = this.parse(notation);
    if (!parsed) return void message.reply({ embeds: [errorEmbed('Invalid Dice', 'Use notation like `2d6`, `1d20`, `d100`.')] });
    const results = Array.from({ length: parsed.rolls }, () => Math.floor(Math.random() * parsed.sides) + 1);
    await message.reply({ embeds: [this.build(notation, results, message.author)] });
  }
}
export default RollCommand;

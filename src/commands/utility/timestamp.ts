// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TimestampCommand extends BaseCommand {
  constructor() {
    super({
      name: 'timestamp',
      description: 'Show Discord timestamp formats for a date or unix timestamp',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ts'],
      examples: ['p!timestamp', 'p!timestamp 1700000000', 'p!timestamp 2024-01-01'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('date').setDescription('Date string or unix timestamp (optional, defaults to now)').setRequired(false)
      ) as SlashCommandBuilder;
  }

  private buildEmbed(unix: number): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} Discord Timestamp Formats`)
      .setColor(COLORS.default)
      .setDescription(`Unix timestamp: \`${unix}\``)
      .addFields(
        { name: 'Short Time `<t:unix:t>`', value: `<t:${unix}:t>`, inline: true },
        { name: 'Long Time `<t:unix:T>`', value: `<t:${unix}:T>`, inline: true },
        { name: 'Short Date `<t:unix:d>`', value: `<t:${unix}:d>`, inline: true },
        { name: 'Long Date `<t:unix:D>`', value: `<t:${unix}:D>`, inline: true },
        { name: 'Short Date/Time `<t:unix:f>`', value: `<t:${unix}:f>`, inline: true },
        { name: 'Long Date/Time `<t:unix:F>`', value: `<t:${unix}:F>`, inline: true },
        { name: 'Relative `<t:unix:R>`', value: `<t:${unix}:R>`, inline: true },
      )
      .setTimestamp();
  }

  private parseInput(input?: string | null): number | null {
    if (!input) return Math.floor(Date.now() / 1000);
    // Try unix timestamp
    const num = Number(input);
    if (!isNaN(num) && num > 0) return Math.floor(num);
    // Try date string
    const d = new Date(input);
    if (!isNaN(d.getTime())) return Math.floor(d.getTime() / 1000);
    return null;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const input = i.options.getString('date');
      const unix = this.parseInput(input);
      if (unix === null) {
        await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid date or timestamp.`)], ephemeral: true });
        return;
      }
      await i.reply({ embeds: [this.buildEmbed(unix)] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const unix = this.parseInput(args[0]);
      if (unix === null) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid date or timestamp.`)] });
        return;
      }
      await m.reply({ embeds: [this.buildEmbed(unix)] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default TimestampCommand;

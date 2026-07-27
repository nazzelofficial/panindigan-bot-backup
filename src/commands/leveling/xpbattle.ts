// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectRedis, getRedisClient } from '../../database/redis/client.js';

export class XpbattleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'xpbattle',
      description: 'Start an XP battle event where XP is doubled for a duration',
      category: 'leveling',
      premiumTier: 'diamond',
      cooldown: 60,
      userPermissions: ['Administrator'],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['xpevent', 'doubxp'],
      examples: ['/xpbattle 2h', 'p!xpbattle 2h'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('duration').setDescription('Duration of the event (e.g. 1h, 30m, 2h30m)').setRequired(true)
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseDuration(input: string): number {
    let seconds = 0;
    const hours = input.match(/(\d+)h/);
    const minutes = input.match(/(\d+)m/);
    if (hours) seconds += parseInt(hours[1]) * 3600;
    if (minutes) seconds += parseInt(minutes[1]) * 60;
    return seconds;
  }

  private formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (h > 0) parts.push(`${h} hour${h !== 1 ? 's' : ''}`);
    if (m > 0) parts.push(`${m} minute${m !== 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(' and ') : '0 minutes';
  }

  private async startEvent(guildId: string, durationSeconds: number): Promise<void> {
    await connectRedis();
    const redis = getRedisClient();
    const key = `xpbattle:${guildId}`;
    const endTime = Date.now() + durationSeconds * 1000;
    await redis.setEx(key, durationSeconds, JSON.stringify({ active: true, endTime, multiplier: 2 }));
  }

  private buildEmbed(durationStr: string, durationSeconds: number): EmbedBuilder {
    const endTime = new Date(Date.now() + durationSeconds * 1000);
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.leveling} ⚔️ XP Battle Event Started!`)
      .setColor(COLORS.gold)
      .setDescription('**Double XP is now active for this server!**\nEarn twice as much XP for every message during this event.')
      .addFields(
        { name: '⏱️ Duration', value: this.formatDuration(durationSeconds), inline: true },
        { name: '🔢 Multiplier', value: '2x XP', inline: true },
        { name: '🕐 Ends At', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: false },
      )
      .setFooter({ text: `Event active for ${durationStr}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const durationStr = interaction.options.getString('duration', true);
    const durationSeconds = this.parseDuration(durationStr);

    if (durationSeconds < 60) {
      await interaction.reply({ content: `${EMOJIS.error} Duration must be at least 1 minute. Use format like \`1h\`, \`30m\`, \`2h30m\`.`, ephemeral: true });
      return;
    }
    if (durationSeconds > 86400) {
      await interaction.reply({ content: `${EMOJIS.error} Duration cannot exceed 24 hours.`, ephemeral: true });
      return;
    }

    await interaction.deferReply();
    try {
      await this.startEvent(interaction.guildId!, durationSeconds);
      const embed = this.buildEmbed(durationStr, durationSeconds);
      await interaction.editReply({ embeds: [embed] });
    } catch (e) {
      await interaction.editReply({ content: `${EMOJIS.error} Failed to start XP battle event.` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    if (!args[0]) {
      await message.reply(`${EMOJIS.error} Please provide a duration. Example: \`p!xpbattle 2h\``);
      return;
    }
    const durationStr = args[0];
    const durationSeconds = this.parseDuration(durationStr);

    if (durationSeconds < 60) {
      await message.reply(`${EMOJIS.error} Duration must be at least 1 minute. Use format like \`1h\`, \`30m\`, \`2h30m\`.`);
      return;
    }
    if (durationSeconds > 86400) {
      await message.reply(`${EMOJIS.error} Duration cannot exceed 24 hours.`);
      return;
    }

    try {
      await this.startEvent(message.guildId!, durationSeconds);
      const embed = this.buildEmbed(durationStr, durationSeconds);
      await message.reply({ embeds: [embed] });
    } catch {
      await message.reply(`${EMOJIS.error} Failed to start XP battle event.`);
    }
  }
}

export default XpbattleCommand;

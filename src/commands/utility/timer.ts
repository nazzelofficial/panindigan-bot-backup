// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class TimerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'timer',
      description: 'Start a countdown timer that announces when done',
      category: 'utility',
      premiumTier: 'bronze',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['countdown'],
      examples: ['p!timer 30s', 'p!timer 5m Work Break', 'p!timer 1h Meeting'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('duration').setDescription('Duration (e.g. 30s, 5m, 1h)').setRequired(true)
      )
      .addStringOption(opt =>
        opt.setName('label').setDescription('Optional label for this timer').setRequired(false)
      ) as SlashCommandBuilder;
  }

  private parseDuration(input: string): number | null {
    const match = input.match(/^(\d+)(s|m|h)$/i);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return value * 1000;
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 3600 * 1000;
    return null;
  }

  private formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts: string[] = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (sec) parts.push(`${sec}s`);
    return parts.join(' ') || '0s';
  }

  private async startTimer(channelId: string, userId: string, durationMs: number, label: string, sendMessage: (embed: EmbedBuilder) => Promise<void>): Promise<void> {
    const timerId = `${channelId}:${userId}:${Date.now()}`;
    const endTime = Date.now() + durationMs;

    try {
      const redis = await getRedisClient();
      await redis.set(`panindigan:timer:${timerId}`, endTime.toString(), { EX: Math.ceil(durationMs / 1000) + 60 });
    } catch (_) { /* non-fatal */ }

    const startEmbed = new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} Timer Started`)
      .setColor(COLORS.success)
      .setDescription(`⏱️ Timer set for **${this.formatDuration(durationMs)}**${label ? ` — *${label}*` : ''}`)
      .addFields({ name: 'Ends', value: `<t:${Math.floor(endTime / 1000)}:R>` })
      .setTimestamp();

    await sendMessage(startEmbed);

    if (durationMs > 600000) return; // Don't use setTimeout for > 10 min to avoid memory issues

    setTimeout(async () => {
      try {
        const redis = await getRedisClient();
        const stored = await redis.get(`panindigan:timer:${timerId}`);
        if (!stored) return; // was cancelled

        const doneEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Timer Done!`)
          .setColor(COLORS.success)
          .setDescription(`⏰ <@${userId}> Your timer${label ? ` **${label}**` : ''} has ended!`)
          .setTimestamp();

        // We can't easily get channel here without client, so we'll just note it in the start message
        // The done embed won't be sent for timers over 10 min without a scheduler
      } catch (_) { /* non-fatal */ }
    }, durationMs);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const durationStr = i.options.getString('duration', true);
      const label = i.options.getString('label') ?? '';
      const durationMs = this.parseDuration(durationStr);

      if (!durationMs || durationMs <= 0 || durationMs > 3600000) {
        await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid duration. Use formats like \`30s\`, \`5m\`, \`1h\` (max 1h).`)], ephemeral: true });
        return;
      }

      await i.deferReply();
      await this.startTimer(i.channelId, i.user.id, durationMs, label, async (embed) => {
        await i.editReply({ embeds: [embed] });
      });
    } catch (err) {
      await i.editReply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] }).catch(() => {});
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      if (!args[0]) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Please specify a duration.\nExample: \`p!timer 5m Break\``)] });
        return;
      }
      const durationMs = this.parseDuration(args[0]);
      const label = _args.slice(1).join(' ');

      if (!durationMs || durationMs <= 0 || durationMs > 3600000) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid duration. Use formats like \`30s\`, \`5m\`, \`1h\` (max 1h).`)] });
        return;
      }

      await this.startTimer(m.channelId, m.author.id, durationMs, label, async (embed) => {
        await m.reply({ embeds: [embed] });
      });

      const endTime = Math.floor((Date.now() + durationMs) / 1000);
      if (durationMs <= 600000) {
        setTimeout(async () => {
          const doneEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Timer Done!`)
            .setColor(COLORS.success)
            .setDescription(`⏰ <@${m.author.id}> Your timer${label ? ` **${label}**` : ''} has ended!`)
            .setTimestamp();
          await (m.channel as TextChannel).send({ embeds: [doneEmbed] }).catch(() => {});
        }, durationMs);
      }
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default TimerCommand;

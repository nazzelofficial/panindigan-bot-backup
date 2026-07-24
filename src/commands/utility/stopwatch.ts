import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getRedisClient } from '../../database/redis/client';

export class StopwatchCommand extends BaseCommand {
  constructor() {
    super({
      name: 'stopwatch',
      description: 'Track time with a stopwatch (start/stop/lap)',
      category: 'utility',
      premiumTier: 'bronze',
      cooldown: 3,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['sw'],
      examples: ['p!stopwatch start', 'p!stopwatch lap', 'p!stopwatch stop'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('action').setDescription('Action to perform').setRequired(true)
          .addChoices(
            { name: 'start', value: 'start' },
            { name: 'stop', value: 'stop' },
            { name: 'lap', value: 'lap' },
          )
      ) as SlashCommandBuilder;
  }

  private formatElapsed(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const ms2 = ms % 1000;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms2).padStart(3, '0')}`;
  }

  private async handle(userId: string, action: string): Promise<EmbedBuilder> {
    const redis = await getRedisClient();
    const key = `panindigan:stopwatch:${userId}`;

    if (action === 'start') {
      const existing = await redis.hGetAll(key);
      if (existing?.running === 'true') {
        return new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} Your stopwatch is already running. Use \`stop\` or \`lap\` first.`);
      }
      await redis.hSet(key, { startedAt: Date.now().toString(), running: 'true', laps: '0', lapData: '[]' });
      await redis.expire(key, 86400);
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Stopwatch Started`)
        .setColor(COLORS.success)
        .setDescription('⏱️ Stopwatch is now running!')
        .setTimestamp();
    }

    const data = await redis.hGetAll(key);
    if (!data?.startedAt) {
      return new EmbedBuilder().setColor(COLORS.warning).setDescription(`${EMOJIS.warning} No stopwatch running. Use \`start\` first.`);
    }

    const elapsed = Date.now() - parseInt(data.startedAt);

    if (action === 'lap') {
      const lapNumber = parseInt(data.laps ?? '0') + 1;
      const lapData: string[] = JSON.parse(data.lapData ?? '[]');
      lapData.push(this.formatElapsed(elapsed));
      await redis.hSet(key, { laps: lapNumber.toString(), lapData: JSON.stringify(lapData) });
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Lap ${lapNumber}`)
        .setColor(COLORS.default)
        .setDescription(`**Lap Time:** \`${this.formatElapsed(elapsed)}\``)
        .addFields({ name: 'All Laps', value: lapData.map((l, idx) => `Lap ${idx + 1}: \`${l}\``).join('\n') || 'None' })
        .setTimestamp();
    }

    if (action === 'stop') {
      const lapData: string[] = JSON.parse(data.lapData ?? '[]');
      await redis.del(key);
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Stopwatch Stopped`)
        .setColor(COLORS.error)
        .setDescription(`**Final Time:** \`${this.formatElapsed(elapsed)}\``)
        .addFields(
          { name: 'Total Laps', value: `${data.laps ?? '0'}`, inline: true },
          { name: 'Lap Times', value: lapData.length > 0 ? lapData.map((l, i) => `Lap ${i + 1}: \`${l}\``).join('\n').slice(0, 1024) : 'None', inline: false },
        )
        .setTimestamp();
    }

    return new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Unknown action. Use \`start\`, \`stop\`, or \`lap\`.`);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const action = i.options.getString('action', true);
      await i.deferReply();
      const embed = await this.handle(i.user.id, action);
      await i.editReply({ embeds: [embed] });
    } catch (err) {
      await i.editReply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] }).catch(() => {});
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const action = args[0]?.toLowerCase();
      if (!['start', 'stop', 'lap'].includes(action)) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Usage: \`p!stopwatch start|stop|lap\``)] });
        return;
      }
      const embed = await this.handle(m.author.id, action);
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default StopwatchCommand;

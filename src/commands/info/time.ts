// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';

// Common IANA timezone shortcuts for autocomplete
const POPULAR_TIMEZONES = [
  'Asia/Manila',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];

const TZ_FLAGS: Record<string, string> = {
  'Asia/Manila':       '🇵🇭',
  'Asia/Singapore':    '🇸🇬',
  'Asia/Tokyo':        '🇯🇵',
  'Asia/Seoul':        '🇰🇷',
  'Asia/Shanghai':     '🇨🇳',
  'Asia/Dubai':        '🇦🇪',
  'Asia/Kolkata':      '🇮🇳',
  'Asia/Bangkok':      '🇹🇭',
  'Europe/London':     '🇬🇧',
  'Europe/Paris':      '🇫🇷',
  'Europe/Berlin':     '🇩🇪',
  'America/New_York':  '🇺🇸',
  'America/Chicago':   '🇺🇸',
  'America/Los_Angeles':'🇺🇸',
  'America/Toronto':   '🇨🇦',
  'America/Sao_Paulo': '🇧🇷',
  'Australia/Sydney':  '🇦🇺',
  'Pacific/Auckland':  '🇳🇿',
  'UTC':               '🌐',
};

export class TimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'time',
      description: 'Display the current time in any timezone',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tz', 'timezone', 'clock'],
      examples: ['/time Asia/Manila', '/time America/New_York', 'p!time Europe/London'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(opt =>
        opt.setName('timezone')
          .setDescription('IANA timezone (e.g. Asia/Manila, America/New_York)')
          .setRequired(false)
          .setAutocomplete(true),
      ) as SlashCommandBuilder;
  }

  public async handleAutocomplete(interaction: any): Promise<void> {
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = POPULAR_TIMEZONES
      .filter(tz => tz.toLowerCase().includes(focused))
      .slice(0, 25)
      .map(tz => ({ name: `${TZ_FLAGS[tz] ?? '🌍'} ${tz}`, value: tz }));
    await interaction.respond(choices);
  }

  private buildEmbed(timezone: string): EmbedBuilder | null {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const offset = now.toLocaleString('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      }).split(' ').pop();

      const flag = TZ_FLAGS[timezone] ?? '🌍';

      return new EmbedBuilder()
        .setColor(PALETTE.info)
        .setTitle(`${KIT.time} World Clock`)
        .setDescription(
          `${flag} **${timezone}**\n\n` +
          `\`\`\`\n${timeStr}\n\`\`\`\n` +
          `📅 ${dateStr}\n` +
          `🌐 Offset: **${offset ?? 'N/A'}**`
        )
        .setFooter({ text: 'Times update per-command  •  Use /time <timezone> for any IANA tz' })
        .setTimestamp(now);
    } catch {
      return null;
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const timezone = interaction.options.getString('timezone') ?? 'Asia/Manila';
    const embed = this.buildEmbed(timezone);
    if (!embed) {
      await interaction.reply({
        embeds: [errorEmbed('Invalid Timezone', `\`${timezone}\` is not a valid IANA timezone.\n\nExamples: \`Asia/Manila\`, \`America/New_York\`, \`Europe/London\``)],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const timezone = args[0] ?? 'Asia/Manila';
    const embed = this.buildEmbed(timezone);
    if (!embed) {
      await message.reply({
        embeds: [errorEmbed('Invalid Timezone', `\`${timezone}\` is not a valid IANA timezone.\n\nExamples: \`Asia/Manila\`, \`America/New_York\`, \`Europe/London\``)],
      });
      return;
    }
    await message.reply({ embeds: [embed] });
  }
}

export default TimeCommand;

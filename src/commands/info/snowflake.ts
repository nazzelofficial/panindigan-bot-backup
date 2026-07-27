// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

function decodeSnowflake(id: string): { timestamp: Date; workerId: number; processId: number; increment: number } | null {
  try {
    const bigId = BigInt(id);
    const DISCORD_EPOCH = BigInt(1420070400000);
    const timestamp = new Date(Number((bigId >> BigInt(22)) + DISCORD_EPOCH));
    const workerId = Number((bigId & BigInt(0x3E0000)) >> BigInt(17));
    const processId = Number((bigId & BigInt(0x1F000)) >> BigInt(12));
    const increment = Number(bigId & BigInt(0xFFF));
    return { timestamp, workerId, processId, increment };
  } catch {
    return null;
  }
}

export class SnowflakeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'snowflake',
      description: 'Decode a Discord snowflake ID to extract its timestamp and metadata',
      category: 'info',
      premiumTier: 'free',
      cooldown: 3,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['sf', 'decodeid', 'idinfo'],
      examples: ['/snowflake 123456789012345678', 'p!snowflake 123456789012345678'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('id').setDescription('The Discord snowflake ID to decode').setRequired(true)
      )
    ) as SlashCommandBuilder;
  }

  private buildEmbed(id: string): EmbedBuilder {
    const decoded = decodeSnowflake(id);
    if (!decoded) {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setDescription(`${EMOJIS.error} Invalid snowflake ID: \`${id}\``);
    }

    const { timestamp, workerId, processId, increment } = decoded;
    const unixSec = Math.floor(timestamp.getTime() / 1000);

    return new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Snowflake Decoder`)
      .setColor(COLORS.info)
      .addFields(
        { name: '❄️ Snowflake ID', value: `\`${id}\``, inline: false },
        { name: '📅 Created At', value: `<t:${unixSec}:F> (<t:${unixSec}:R>)`, inline: false },
        { name: '🕐 Unix Timestamp', value: `\`${timestamp.getTime()}\` ms`, inline: true },
        { name: '🔧 Worker ID', value: `\`${workerId}\``, inline: true },
        { name: '⚙️ Process ID', value: `\`${processId}\``, inline: true },
        { name: '🔢 Increment', value: `\`${increment}\``, inline: true },
      )
      .setFooter({ text: 'Discord Epoch: January 1, 2015' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const id = interaction.options.getString('id', true);
    await interaction.reply({ embeds: [this.buildEmbed(id)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const id = args[0];
    if (!id) {
      await message.reply(`${EMOJIS.error} Please provide a Discord snowflake ID.\nExample: \`p!snowflake 123456789012345678\``);
      return;
    }
    await message.reply({ embeds: [this.buildEmbed(id)] });
  }
}

export default SnowflakeCommand;

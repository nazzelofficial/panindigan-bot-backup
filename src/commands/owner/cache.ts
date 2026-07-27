// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CacheCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'cache',
      description: 'Manage or view cache stats (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cachectl'],
      examples: ['/cache clear', '/cache stats', 'p!cache clear', 'p!cache stats'],
    };
    super(options);
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  private clearCache(): number {
    const keys = Object.keys(require.cache);
    for (const key of keys) {
      // Only clear non-core node_modules
      if (!key.includes('node_modules/discord.js') && !key.includes('node_modules/@discordjs')) {
        delete require.cache[key];
      }
    }
    return keys.length;
  }

  private getStatsEmbed(requesterTag: string): EmbedBuilder {
    const mem = process.memoryUsage();
    const cacheSize = Object.keys(require.cache).length;
    return new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`${EMOJIS.info} Cache & Memory Stats`)
      .addFields(
        { name: '📦 Module Cache Size', value: `\`${cacheSize}\` modules`, inline: true },
        { name: '🧠 Heap Used', value: this.formatBytes(mem.heapUsed), inline: true },
        { name: '📐 Heap Total', value: this.formatBytes(mem.heapTotal), inline: true },
        { name: '💾 RSS', value: this.formatBytes(mem.rss), inline: true },
        { name: '🔗 External', value: this.formatBytes(mem.external), inline: true },
        { name: '📋 Array Buffers', value: this.formatBytes(mem.arrayBuffers), inline: true },
      )
      .setFooter({ text: `Requested by ${requesterTag}` })
      .setTimestamp();
  }

  private getClearEmbed(cleared: number, requesterTag: string): EmbedBuilder {
    const mem = process.memoryUsage();
    return new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`${EMOJIS.success} Cache Cleared`)
      .setDescription(`Module cache has been cleared.`)
      .addFields(
        { name: '🗑️ Modules Removed', value: `\`${cleared}\``, inline: true },
        { name: '🧠 Heap After', value: this.formatBytes(mem.heapUsed), inline: true },
      )
      .setFooter({ text: `Requested by ${requesterTag}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getString('subcommand', true).toLowerCase();
    await interaction.deferReply({ ephemeral: true });

    if (subcommand === 'clear') {
      const cleared = this.clearCache();
      await interaction.editReply({ embeds: [this.getClearEmbed(cleared, interaction.user.tag)] });
    } else if (subcommand === 'stats') {
      await interaction.editReply({ embeds: [this.getStatsEmbed(interaction.user.tag)] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Invalid Subcommand`)
        .setDescription('Valid subcommands: `clear`, `stats`')
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const subcommand = args[0]?.toLowerCase();

    if (!subcommand) {
      await message.reply(`${EMOJIS.error} Please provide a subcommand: \`clear\` or \`stats\``);
      return;
    }

    if (subcommand === 'clear') {
      const cleared = this.clearCache();
      await message.reply({ embeds: [this.getClearEmbed(cleared, message.author.tag)] });
    } else if (subcommand === 'stats') {
      await message.reply({ embeds: [this.getStatsEmbed(message.author.tag)] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Invalid Subcommand`)
        .setDescription('Valid subcommands: `clear`, `stats`')
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    }
  }
}

export default CacheCommand;

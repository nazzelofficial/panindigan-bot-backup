/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Help UI
 *  Modern help system with dashboard and search
 * ═══════════════════════════════════════════════════
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ChatInputCommandInteraction,
  Message,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} from 'discord.js';
import { EmbedManager } from './EmbedManager.js';
import { ButtonManager } from './ButtonManager.js';
import { SelectMenuManager } from './SelectMenuManager.js';
import { PaginationManager } from './PaginationManager.js';

// ─── Command Info Interface ───────────────────────────────────────────────────────
export interface CommandInfo {
  name: string;
  description: string;
  category: string;
  aliases?: string[];
  usage?: string;
  examples?: string[];
  permissions?: string[];
  cooldown?: number;
  related?: string[];
  premium?: boolean;
  nsfw?: boolean;
  devOnly?: boolean;
}

// ─── Category Info Interface ───────────────────────────────────────────────────────
export interface CategoryInfo {
  name: string;
  emoji: string;
  description: string;
  commands: string[];
}

// ─── Help UI Class ────────────────────────────────────────────────────────────────
export class HelpUI {
  private static categories: CategoryInfo[] = [
    { name: 'Music', emoji: '🎵', description: 'Play and manage music', commands: [] },
    { name: 'Moderation', emoji: '🛡️', description: 'Moderate your server', commands: [] },
    { name: 'Economy', emoji: '💰', description: 'Manage virtual currency', commands: [] },
    { name: 'Games', emoji: '🎮', description: 'Play fun games', commands: [] },
    { name: 'Fun', emoji: '🎉', description: 'Fun and entertainment', commands: [] },
    { name: 'AI', emoji: '🤖', description: 'AI-powered features', commands: [] },
    { name: 'Utility', emoji: '🔧', description: 'Useful utilities', commands: [] },
    { name: 'Leveling', emoji: '📈', description: 'Level up system', commands: [] },
    { name: 'Giveaway', emoji: '🎁', description: 'Host giveaways', commands: [] },
    { name: 'Premium', emoji: '💎', description: 'Premium features', commands: [] },
    { name: 'Social', emoji: '🌐', description: 'Social features', commands: [] },
    { name: 'Admin', emoji: '👑', description: 'Server administration', commands: [] },
    { name: 'Image', emoji: '🖼️', description: 'Image generation', commands: [] },
    { name: 'Info', emoji: 'ℹ️', description: 'Information commands', commands: [] },
    { name: 'Starboard', emoji: '⭐', description: 'Star messages', commands: [] },
  ];

  /**
   * Create main help dashboard embed
   */
  static createDashboardEmbed(botName: string, commandCount: number): EmbedBuilder {
    const categoryList = this.categories
      .map(cat => `${cat.emoji} **${cat.name}** - ${cat.description}`)
      .join('\n');

    const embed = EmbedManager.help('Help Dashboard')
      .setDescription(`Welcome to **${botName}**! I have **${commandCount}** commands available.\n\n**Categories:**\n${categoryList}`)
      .addFields(
        {
          name: '🔍 How to Use',
          value: '• Use the select menu to browse categories\n• Click a category to view its commands\n• Use /help [command] for specific command info',
          inline: false,
        },
        {
          name: '💡 Tips',
          value: '• Type /help followed by a command name for details\n• Use the search feature to find commands\n• Add commands to favorites for quick access',
          inline: false,
        }
      )
      .setFooter({ text: `${botName} Help System` })
      .setTimestamp();

    return embed;
  }

  /**
   * Create category embed with commands
   */
  static createCategoryEmbed(category: CategoryInfo, commands: CommandInfo[]): EmbedBuilder {
    const commandList = commands
      .map(cmd => {
        const badges = [];
        if (cmd.premium) badges.push('💎');
        if (cmd.nsfw) badges.push('🔞');
        if (cmd.devOnly) badges.push('🔒');
        const badgeStr = badges.length > 0 ? ` ${badges.join(' ')}` : '';
        return `• \`/${cmd.name}\`${badgeStr}\n  ${cmd.description}`;
      })
      .join('\n\n');

    const embed = EmbedManager.help(`${category.emoji} ${category.name} Commands`)
      .setDescription(commandList || 'No commands available in this category.')
      .addFields({
        name: '📊 Statistics',
        value: `${commands.length} commands available`,
        inline: true,
      })
      .setFooter({ text: `Category: ${category.name}` })
      .setTimestamp();

    return embed;
  }

  /**
   * Create command detail embed
   */
  static createCommandEmbed(command: CommandInfo): EmbedBuilder {
    const embed = EmbedManager.help(`/${command.name}`)
      .setDescription(command.description);

    const fields: { name: string; value: string; inline?: boolean }[] = [];

    if (command.aliases && command.aliases.length > 0) {
      fields.push({
        name: '🔀 Aliases',
        value: command.aliases.map(a => `\`${a}\``).join(', '),
        inline: true,
      });
    }

    if (command.usage) {
      fields.push({
        name: '📝 Usage',
        value: `\`${command.usage}\``,
        inline: false,
      });
    }

    if (command.examples && command.examples.length > 0) {
      fields.push({
        name: '💡 Examples',
        value: command.examples.map(e => `\`${e}\``).join('\n'),
        inline: false,
      });
    }

    if (command.permissions && command.permissions.length > 0) {
      fields.push({
        name: '🔒 Required Permissions',
        value: command.permissions.join(', '),
        inline: false,
      });
    }

    if (command.cooldown) {
      fields.push({
        name: '⏱️ Cooldown',
        value: `${command.cooldown} seconds`,
        inline: true,
      });
    }

    if (command.category) {
      fields.push({
        name: '📁 Category',
        value: command.category,
        inline: true,
      });
    }

    const badges: string[] = [];
    if (command.premium) badges.push('💎 Premium');
    if (command.nsfw) badges.push('🔞 NSFW');
    if (command.devOnly) badges.push('🔒 Developer Only');
    if (badges.length > 0) {
      fields.push({
        name: '🏷️ Tags',
        value: badges.join(' • '),
        inline: false,
      });
    }

    if (command.related && command.related.length > 0) {
      fields.push({
        name: '🔗 Related Commands',
        value: command.related.map(r => `\`/${r}\``).join(', '),
        inline: false,
      });
    }

    embed.addFields(...fields);
    embed.setFooter({ text: `Command: /${command.name}` });
    embed.setTimestamp();

    return embed;
  }

  /**
   * Create search results embed
   */
  static createSearchEmbed(query: string, results: CommandInfo[]): EmbedBuilder {
    const resultList = results
      .slice(0, 10)
      .map((cmd, i) => {
        const badges = [];
        if (cmd.premium) badges.push('💎');
        if (cmd.nsfw) badges.push('🔞');
        const badgeStr = badges.length > 0 ? ` ${badges.join(' ')}` : '';
        return `**${i + 1}.** \`/${cmd.name}\`${badgeStr}\n   └ ${cmd.description}`;
      })
      .join('\n\n');

    const embed = EmbedManager.searchResult('Command Search Results')
      .setDescription(`**Query:** ${query}\n\n**Results (${results.length}):**\n${resultList || 'No results found.'}`)
      .setFooter({ text: results.length > 10 ? `Showing 10 of ${results.length} results` : `${results.length} results found` })
      .setTimestamp();

    return embed;
  }

  /**
   * Create favorites embed
   */
  static createFavoritesEmbed(favorites: CommandInfo[]): EmbedBuilder {
    const favoriteList = favorites
      .map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`)
      .join('\n');

    const embed = EmbedManager.help('Favorite Commands')
      .setDescription(favoriteList || 'No favorite commands yet.')
      .addFields({
        name: '💡 Tip',
        value: 'Use /help favorite [command] to add commands to your favorites',
        inline: false,
      })
      .setFooter({ text: `${favorites.length} favorite commands` })
      .setTimestamp();

    return embed;
  }

  /**
   * Create recently used embed
   */
  static createRecentEmbed(recent: CommandInfo[]): EmbedBuilder {
    const recentList = recent
      .map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`)
      .join('\n');

    const embed = EmbedManager.help('Recently Used Commands')
      .setDescription(recentList || 'No recently used commands.')
      .setFooter({ text: `${recent.length} recent commands` })
      .setTimestamp();

    return embed;
  }

  /**
   * Create help dashboard components
   */
  static createDashboardComponents(prefix: string): ActionRowBuilder<ButtonBuilder>[] {
    return [
      ButtonManager.dashboard(prefix, {
        showSettings: false,
        showStatistics: false,
        showRefresh: true,
        showClose: true,
      }),
    ];
  }

  /**
   * Create category select menu
   */
  static createCategorySelect(prefix: string): ActionRowBuilder<StringSelectMenuBuilder> {
    return SelectMenuManager.helpCategory(`${prefix}_category`);
  }

  /**
   * Send help dashboard
   */
  static async sendDashboard(
    source: ChatInputCommandInteraction | Message,
    botName: string,
    commandCount: number,
    prefix: string = 'help'
  ): Promise<Message | null> {
    const embed = this.createDashboardEmbed(botName, commandCount);
    const components = [
      this.createCategorySelect(prefix),
      ...this.createDashboardComponents(prefix),
    ];

    if (source instanceof Message) {
      return await source.reply({ embeds: [embed], components });
    } else {
      await source.reply({ embeds: [embed], components });
      return await source.fetchReply() as Message;
    }
  }

  /**
   * Send category view
   */
  static async sendCategory(
    source: ChatInputCommandInteraction | Message,
    category: CategoryInfo,
    commands: CommandInfo[],
    prefix: string = 'help'
  ): Promise<Message | null> {
    const embed = this.createCategoryEmbed(category, commands);
    const components = [
      ButtonManager.navigation(prefix, 0, 1, {
        showFirst: false,
        showLast: false,
        showHome: true,
        showRefresh: false,
        showClose: true,
      }),
    ];

    if (source instanceof Message) {
      return await source.reply({ embeds: [embed], components });
    } else {
      await source.reply({ embeds: [embed], components });
      return await source.fetchReply() as Message;
    }
  }

  /**
   * Send command detail view
   */
  static async sendCommand(
    source: ChatInputCommandInteraction | Message,
    command: CommandInfo,
    prefix: string = 'help'
  ): Promise<Message | null> {
    const embed = this.createCommandEmbed(command);
    const components = [
      ButtonManager.navigation(prefix, 0, 1, {
        showFirst: false,
        showLast: false,
        showHome: true,
        showRefresh: false,
        showClose: true,
      }),
    ];

    if (source instanceof Message) {
      return await source.reply({ embeds: [embed], components });
    } else {
      await source.reply({ embeds: [embed], components });
      return await source.fetchReply() as Message;
    }
  }

  /**
   * Search commands
   */
  static searchCommands(query: string, commands: CommandInfo[]): CommandInfo[] {
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.description.toLowerCase().includes(lowerQuery) ||
      cmd.aliases?.some(a => a.toLowerCase().includes(lowerQuery)) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get commands by category
   */
  static getCommandsByCategory(category: string, commands: CommandInfo[]): CommandInfo[] {
    return commands.filter(cmd => cmd.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Format permissions for display
   */
  static formatPermissions(permissions: string[]): string {
    return permissions.map(p => {
      const permissionNames: Record<string, string> = {
        ADMINISTRATOR: 'Administrator',
        MANAGE_GUILD: 'Manage Server',
        MANAGE_CHANNELS: 'Manage Channels',
        MANAGE_MESSAGES: 'Manage Messages',
        KICK_MEMBERS: 'Kick Members',
        BAN_MEMBERS: 'Ban Members',
        MUTE_MEMBERS: 'Mute Members',
        DEAFEN_MEMBERS: 'Deafen Members',
        MOVE_MEMBERS: 'Move Members',
      };
      return permissionNames[p] || p;
    }).join(', ');
  }
}

// ─── Export Help UI ───────────────────────────────────────────────────────────────
export default HelpUI;

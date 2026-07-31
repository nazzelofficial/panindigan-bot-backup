// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder,
} from 'discord.js';
import { HelpUI } from '../../structures/HelpUI.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';

// Shared emoji map (matches ComponentHandler)
const CATEGORY_EMOJIS: Record<string, string> = {
  moderation: '🛡️', admin: '👑', music: '🎵', economy: '💰', games: '🎮',
  fun: '🎉', ai: '🤖', info: 'ℹ️', utility: '🔧', social: '🌐',
  leveling: '📈', giveaway: '🎁', image: '🖼️', starboard: '⭐',
  applications: '📝', premium: '💎', owner: '🔑', help: '❓',
};

/**
 * Builds the 4-row category button grid.
 * customIds use the `help_<category>` pattern that ComponentHandler already handles.
 */
export function buildHelpCategoryRows(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_moderation').setLabel('🛡️ Mod').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_admin').setLabel('👑 Admin').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_music').setLabel('🎵 Music').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_economy').setLabel('💰 Economy').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_games').setLabel('🎮 Games').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_fun').setLabel('🎉 Fun').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_ai').setLabel('🤖 AI').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_utility').setLabel('🔧 Utility').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_social').setLabel('🌐 Social').setStyle(ButtonStyle.Secondary),
  );
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_leveling').setLabel('📈 Level').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_giveaway').setLabel('🎁 Giveaway').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_image').setLabel('🖼️ Image').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_starboard').setLabel('⭐ Starboard').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_applications').setLabel('📝 Apply').setStyle(ButtonStyle.Success),
  );
  const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_premium').setLabel('💎 Premium').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Home').setStyle(ButtonStyle.Secondary),
  );
  return [row1, row2, row3, row4];
}

export class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'help',
      description: 'Display the help menu with all commands',
      category: 'help',
      cooldown: 3,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['h', 'commands'],
      examples: ['/help', 'p!help', '/help economy', 'p!help music'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('target')
          .setDescription('Command name or category to get help for')
          .setRequired(false)
      ) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getString('target');
    if (target) {
      await this.showCommandHelp(interaction, target);
    } else {
      await this.showMainHelp(interaction);
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = args[0];
    if (target) {
      await this.showCommandHelp(message, target);
    } else {
      await this.showMainHelp(message);
    }
  }

  // ── Main dashboard ────────────────────────────────────────────────────────────

  private async showMainHelp(ctx: ChatInputCommandInteraction | Message): Promise<void> {
    const client = ctx.client as PanindiganClient;
    const embed = new EmbedBuilder()
      .setTitle(`🤖 ${client.config.bot.name} • All-in-One Discord Bot`)
      .setDescription(
        `Prefix: \`${client.config.bot.prefix}\` • **${client.commands.size}** commands available\n\n` +
        `Click a category button to browse its commands.`
      )
      .setColor(0x5865f2)
      .addFields(
        { name: '🆓 Free', value: 'Essential commands for everyone', inline: true },
        { name: '💎 Premium', value: 'Bronze → Diamond tiers', inline: true },
      )
      .setFooter({ text: `${client.config.bot.name} Help System` })
      .setTimestamp();

    const rows = buildHelpCategoryRows();

    if (ctx instanceof ChatInputCommandInteraction) {
      await ctx.reply({ embeds: [embed], components: rows });
    } else {
      await ctx.reply({ embeds: [embed], components: rows });
    }
  }

  // ── Command / category lookup ─────────────────────────────────────────────────

  private async showCommandHelp(ctx: ChatInputCommandInteraction | Message, target: string): Promise<void> {
    const client = ctx.client as PanindiganClient;
    const command = client.commands.get(target.toLowerCase());

    if (!command) {
      const categoryCommands = client.commands.filter(cmd => cmd.category === target.toLowerCase());
      if (categoryCommands.size > 0) {
        await this.showCategoryHelp(ctx, target.toLowerCase());
      } else {
        await ErrorHandler.notFound(ctx, 'Command or Category', target);
      }
      return;
    }

    const embed = HelpUI.createCommandEmbed({
      name: command.name,
      description: command.description,
      category: command.category,
      aliases: command.aliases,
      usage: `/${command.name}`,
      examples: command.examples,
      permissions: command.userPermissions as string[],
      cooldown: command.cooldown,
      premium: command.premiumTier !== 'free',
      nsfw: false,
      devOnly: command.ownerOnly,
      related: [],
    });

    const catLabel = command.category[0].toUpperCase() + command.category.slice(1);
    const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Main Menu').setStyle(ButtonStyle.Secondary),
      // Use `help_<category>` — ComponentHandler routes this correctly
      new ButtonBuilder()
        .setCustomId(`help_${command.category}`)
        .setLabel(`${CATEGORY_EMOJIS[command.category] || '📌'} ${catLabel} Commands`)
        .setStyle(ButtonStyle.Primary),
    );

    if (ctx instanceof ChatInputCommandInteraction) {
      await ctx.reply({ embeds: [embed], components: [backRow] });
    } else {
      await ctx.reply({ embeds: [embed], components: [backRow] });
    }
  }

  private async showCategoryHelp(ctx: ChatInputCommandInteraction | Message, category: string): Promise<void> {
    const client = ctx.client as PanindiganClient;
    const emoji = CATEGORY_EMOJIS[category] || '📌';
    const title = category[0].toUpperCase() + category.slice(1);

    const seen = new Set<string>();
    const lines: string[] = [];
    for (const [, cmd] of client.commands) {
      if (cmd.category !== category || seen.has(cmd.name)) continue;
      seen.add(cmd.name);
      const badge = cmd.premiumTier !== 'free' ? ` 💎` : '';
      lines.push(`\`/${cmd.name}\`${badge} — ${cmd.description}`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} ${title} Commands`)
      .setDescription(lines.length ? lines.join('\n') : 'No commands in this category.')
      .setColor(0x5865f2)
      .setFooter({ text: `${lines.length} command(s)` })
      .setTimestamp();

    const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Back to Main Menu').setStyle(ButtonStyle.Secondary),
    );

    if (ctx instanceof ChatInputCommandInteraction) {
      await ctx.reply({ embeds: [embed], components: [backRow] });
    } else {
      await ctx.reply({ embeds: [embed], components: [backRow] });
    }
  }
}

export default HelpCommand;

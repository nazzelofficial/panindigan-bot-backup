// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder,
} from 'discord.js';
import { HelpUI } from '../../structures/HelpUI.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';

export class HelpCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'help',
      description: 'Display the help menu with all commands',
      category: 'help',
      cooldown: 3,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['h', 'commands'],
      examples: ['/help', 'p!help', '/help play', 'p!help music'],
    };
    super(options);
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

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = _args[0];
    
    if (target) {
      await this.showCommandHelp(message, target);
    } else {
      await this.showMainHelp(message);
    }
  }

  private async showMainHelp(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client as PanindiganClient;
    const embed = HelpUI.createDashboardEmbed(client.config.bot.name || 'Panindigan', client.commands.size, client.config.bot.prefix || 'p!');
    const components = HelpUI.createDashboardComponents();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed], components });
    } else {
      await interaction.reply({ embeds: [embed], components });
    }
  }

  private async showCommandHelp(interaction: ChatInputCommandInteraction | Message, target: string): Promise<void> {
    const client = interaction.client as PanindiganClient;
    const command = client.commands.get(target.toLowerCase());

    if (!command) {
      const categoryCommands = client.commands.filter(cmd => cmd.category === target.toLowerCase());
      
      if (categoryCommands.size > 0) {
        await this.showCategoryHelp(interaction, target.toLowerCase());
      } else {
        await ErrorHandler.notFound(interaction, 'Command or Category', target);
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
      permissions: command.userPermissions,
      cooldown: command.cooldown,
      premium: command.premiumTier,
      nsfw: false,
      devOnly: command.ownerOnly,
      related: [],
    });

    const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Back to Help').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`help_category_${command.category}`).setLabel(`📁 ${command.category[0].toUpperCase() + command.category.slice(1)} Commands`).setStyle(ButtonStyle.Primary),
    );

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed], components: [backRow] });
    } else {
      await interaction.reply({ embeds: [embed], components: [backRow] });
    }
  }

  private async showCategoryHelp(interaction: ChatInputCommandInteraction | Message, category: string): Promise<void> {
    const client = interaction.client as PanindiganClient;
    const commands = client.commands.filter(cmd => cmd.category === category);
    
    const embed = HelpUI.createCategoryEmbed(category, Array.from(commands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      category: cmd.category,
      aliases: cmd.aliases,
      usage: `/${cmd.name}`,
      examples: cmd.examples,
      permissions: cmd.userPermissions,
      cooldown: cmd.cooldown,
      premium: cmd.premiumTier,
      nsfw: false,
      devOnly: cmd.ownerOnly,
      related: [],
    })));

    const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Back to Main Menu').setStyle(ButtonStyle.Secondary),
    );

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed], components: [backRow] });
    } else {
      await interaction.reply({ embeds: [embed], components: [backRow] });
    }
  }
}

export default HelpCommand;

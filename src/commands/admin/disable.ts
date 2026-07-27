// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DisableCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'disable',
      description: 'Disable a command in this server',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['disablecmd', 'disablecommand'],
      examples: ['/disable play', 'p!disable play'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const commandName = interaction.options.getString('command');

    if (!commandName) {
      await interaction.reply({ content: '❌ Please provide a command name to disable.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const client = interaction.client;
    const commands = (client as any).commands;
    const command = commands.get(commandName);

    if (!command) {
      await interaction.reply({ content: '❌ Command not found.', ephemeral: true });
      return;
    }

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const disabledCommands = guild?.disabledCommands || [];

    if (disabledCommands.includes(commandName)) {
      await interaction.reply({ content: '❌ This command is already disabled.', ephemeral: true });
      return;
    }

    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { disabledCommands: [...disabledCommands, commandName] },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Command Disabled`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Command', value: commandName, inline: true },
        { name: 'Disabled by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const commandName = args[0];

    if (!commandName) {
      await message.reply('❌ Please provide a command name to disable.');
      return;
    }

    if (!message.guild) return;

    const client = message.client;
    const commands = (client as any).commands;
    const command = commands.get(commandName);

    if (!command) {
      await message.reply('❌ Command not found.');
      return;
    }

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: message.guild.id },
    });

    const disabledCommands = guild?.disabledCommands || [];

    if (disabledCommands.includes(commandName)) {
      await message.reply('❌ This command is already disabled.');
      return;
    }

    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { disabledCommands: [...disabledCommands, commandName] },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Command Disabled`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Command', value: commandName, inline: true },
        { name: 'Disabled by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DisableCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class LeaveServerCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'leaveserver',
      description: 'Make the bot leave the current server (Owner only)',
      category: 'admin',
      cooldown: 60,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['leave', 'exit'],
      examples: ['/leaveserver', 'p!leaveserver'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const confirm = interaction.options.getString('confirm');

    if (confirm !== 'CONFIRM') {
      await interaction.reply({ content: '❌ This action is irreversible. Type "CONFIRM" to proceed.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    await interaction.deferReply();

    try {
      const prisma = getPrismaClient();

      await prisma.user.deleteMany({
        where: { guildId: interaction.guild.id },
      });

      await prisma.guild.delete({
        where: { guildId: interaction.guild.id },
      });

      await interaction.guild.leave();

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Left Server`)
        .setColor(COLORS.success)
        .setDescription('The bot has left the server and all data has been deleted.')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to leave server.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const confirm = args[0];

    if (confirm !== 'CONFIRM') {
      await message.reply('❌ This action is irreversible. Type "CONFIRM" to proceed.');
      return;
    }

    if (!message.guild) return;

    await message.reply('Leaving server...');

    try {
      const prisma = getPrismaClient();

      await prisma.user.deleteMany({
        where: { guildId: message.guild.id },
      });

      await prisma.guild.delete({
        where: { guildId: message.guild.id },
      });

      await message.guild.leave();

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Left Server`)
        .setColor(COLORS.success)
        .setDescription('The bot has left the server and all data has been deleted.')
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to leave server.');
    }
  }
}

export default LeaveServerCommand;

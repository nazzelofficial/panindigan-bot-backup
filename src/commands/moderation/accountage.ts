// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { Formatter } from '../../utils/Formatter.js';

export class AccountAgeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'accountage',
      description: 'Set minimum account age required to join the server',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['agegate', 'minage'],
      examples: ['/accountage 7d', 'p!accountage 30d'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const duration = interaction.options.getString('duration') || '0';

    if (!interaction.guild) return;

    const durationMs = Formatter.parseTime(duration);
    if (durationMs < 0) {
      await interaction.reply({ content: '❌ Invalid duration format. Use format like 7d, 30d, or 0 to disable.', ephemeral: true });
      return;
    }

    const prisma = getPrismaClient();
    
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { minAccountAge: durationMs },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Account Age Gate Updated`)
      .setColor(durationMs > 0 ? COLORS.warning : COLORS.success)
      .addFields([
        { name: 'Minimum Age', value: durationMs === 0 ? 'Disabled' : Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Effect', value: durationMs === 0 ? 'All accounts can join' : `Accounts must be ${Formatter.formatDuration(Math.floor(durationMs / 1000))} old`, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const duration = args[0] || '0';

    if (!message.guild) return;

    const durationMs = Formatter.parseTime(duration);
    if (durationMs < 0) {
      await message.reply('❌ Invalid duration format. Use format like 7d, 30d, or 0 to disable.');
      return;
    }

    const prisma = getPrismaClient();
    
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { minAccountAge: durationMs },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Account Age Gate Updated`)
      .setColor(durationMs > 0 ? COLORS.warning : COLORS.success)
      .addFields([
        { name: 'Minimum Age', value: durationMs === 0 ? 'Disabled' : Formatter.formatDuration(Math.floor(durationMs / 1000)), inline: true },
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Effect', value: durationMs === 0 ? 'All accounts can join' : `Accounts must be ${Formatter.formatDuration(Math.floor(durationMs / 1000))} old`, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AccountAgeCommand;

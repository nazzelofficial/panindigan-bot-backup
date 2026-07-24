import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ReasonCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reason',
      description: 'Update the reason for a moderation case',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['updatereason', 'editreason'],
      examples: ['/reason 5 Updated reason', 'p!reason 5 Updated reason'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const caseNumber = interaction.options.getInteger('case_number');
    const newReason = interaction.options.getString('reason');

    if (!caseNumber) {
      await interaction.reply({ content: '❌ Please provide a case number.', ephemeral: true });
      return;
    }

    if (!newReason) {
      await interaction.reply({ content: '❌ Please provide a new reason.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findFirst({
        where: { guildId: interaction.guild.id },
        include: { moderation: true },
      });

      if (!user || !user.moderation || user.moderation.cases.length === 0) {
        await interaction.reply({ content: '❌ No moderation cases found.', ephemeral: true });
        return;
      }

      if (caseNumber < 1 || caseNumber > user.moderation.cases.length) {
        await interaction.reply({ content: '❌ Invalid case number.', ephemeral: true });
        return;
      }

      const cases = user.moderation.cases;
      const targetCase = cases[caseNumber - 1];
      const oldReason = targetCase.reason;

      cases[caseNumber - 1] = {
        ...targetCase,
        reason: newReason,
      };

      await prisma.moderation.update({
        where: { userId_guildId: { userId: user.userId, guildId: interaction.guild.id } },
        data: { cases },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Case Reason Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Case #', value: caseNumber.toString(), inline: true },
          { name: 'Old Reason', value: oldReason, inline: false },
          { name: 'New Reason', value: newReason, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to update case reason.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const caseNumber = parseInt(args[0]);
    const newReason = args.slice(1).join(' ');

    if (!caseNumber) {
      await message.reply('❌ Please provide a case number.');
      return;
    }

    if (!newReason) {
      await message.reply('❌ Please provide a new reason.');
      return;
    }

    if (!message.guild) return;

    try {
      const prisma = getPrismaClient();
      const user = await prisma.user.findFirst({
        where: { guildId: message.guild.id },
        include: { moderation: true },
      });

      if (!user || !user.moderation || user.moderation.cases.length === 0) {
        await message.reply('❌ No moderation cases found.');
        return;
      }

      if (caseNumber < 1 || caseNumber > user.moderation.cases.length) {
        await message.reply('❌ Invalid case number.');
        return;
      }

      const cases = user.moderation.cases;
      const targetCase = cases[caseNumber - 1];
      const oldReason = targetCase.reason;

      cases[caseNumber - 1] = {
        ...targetCase,
        reason: newReason,
      };

      await prisma.moderation.update({
        where: { userId_guildId: { userId: user.userId, guildId: message.guild.id } },
        data: { cases },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Case Reason Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Case #', value: caseNumber.toString(), inline: true },
          { name: 'Old Reason', value: oldReason, inline: false },
          { name: 'New Reason', value: newReason, inline: false },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to update case reason.');
    }
  }
}

export default ReasonCommand;

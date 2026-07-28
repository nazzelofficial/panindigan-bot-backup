// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT, errorEmbed, warningEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class WarnCommand extends BaseCommand {
  constructor() {
    super({
      name: 'warn', description: 'Warn a user for rule violations', category: 'moderation',
      cooldown: 3, userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [], guildOnly: true, slashCommand: true, prefixCommand: true,
      aliases: ['w'], examples: ['/warn @user Spamming', 'p!warn @user'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addUserOption(o => o.setName('target').setDescription('User to warn').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for the warning').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(
    interaction: ChatInputCommandInteraction | null,
    message: Message | null,
    target: any, mod: any, reason: string, guildId: string,
  ): Promise<void> {
    if (target.id === (interaction?.user ?? message!.author).id)
      return void (interaction ?? message!).reply({ embeds: [errorEmbed('Cannot Warn', 'You cannot warn yourself.')], ephemeral: !!interaction });
    if (target.bot)
      return void (interaction ?? message!).reply({ embeds: [errorEmbed('Cannot Warn', 'You cannot warn bots.')], ephemeral: !!interaction });

    try {
      const prisma = getPrismaClient();
      const existing = await prisma.moderation.findUnique({
        where: { userId_guildId: { userId: target.id, guildId } },
      });
      const newCount = (existing?.warnings ?? 0) + 1;

      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId } },
        update: {
          warnings: newCount,
          cases: { push: { action: 'warn', moderatorId: mod.id, reason, timestamp: new Date() } },
        },
        create: {
          userId: target.id, guildId, warnings: 1,
          cases: [{ action: 'warn', moderatorId: mod.id, reason, timestamp: new Date() }],
        },
      });

      const embed = new EmbedBuilder()
        .setColor(PALETTE.warning)
        .setAuthor({ name: `${KIT.mod} Warning Issued — ${target.username}`, iconURL: target.displayAvatarURL({ size: 64 }) })
        .addFields(
          { name: '⚠️ Warned User',   value: `<@${target.id}> \`${target.id}\``, inline: true },
          { name: '👮 Moderator',      value: `<@${mod.id}>`,                     inline: true },
          { name: '📋 Reason',         value: reason,                             inline: false },
          { name: '🔢 Total Warnings', value: `**${newCount}**`,                  inline: true },
          { name: '📅 Timestamp',      value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        )
        .setFooter({ text: 'Panindigan Moderation' }).setTimestamp();

      if (interaction) await interaction.reply({ embeds: [embed] });
      else await message!.reply({ embeds: [embed] });
    } catch {
      const err = errorEmbed('Warn Failed', 'Failed to save the warning to the database.');
      if (interaction) await interaction.reply({ embeds: [err], ephemeral: true });
      else await message!.reply({ embeds: [err] });
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    await this.run(interaction, null, target, interaction.user, reason, interaction.guild!.id);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    if (!target) return void message.reply({ embeds: [errorEmbed('No User', 'Please mention a user to warn.')] });
    const reason = args.slice(1).join(' ') || 'No reason provided';
    await this.run(null, message, target, message.author, reason, message.guild!.id);
  }
}
export default WarnCommand;

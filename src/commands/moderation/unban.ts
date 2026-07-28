// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed, successEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class UnbanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unban', description: 'Unban a user from the server', category: 'moderation',
      cooldown: 3, userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['pardon'], examples: ['/unban 123456789012345678', 'p!unban 123456789012345678'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addUserOption(o => o.setName('target').setDescription('User to unban (ID or @mention)').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason for unban').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(
    interaction: ChatInputCommandInteraction | null, message: Message | null,
    targetId: string, mod: any, reason: string, guildId: string,
  ): Promise<void> {
    const guild = interaction?.guild ?? message!.guild!;
    const ban = await guild.bans.fetch(targetId).catch(() => null);
    if (!ban) {
      const err = errorEmbed('Not Banned', 'This user is not currently banned from this server.');
      if (interaction) return void interaction.reply({ embeds: [err], ephemeral: true });
      return void message!.reply({ embeds: [err] });
    }

    try {
      await guild.bans.remove(targetId, reason);
      getPrismaClient().moderation.upsert({
        where: { userId_guildId: { userId: targetId, guildId } },
        update: { cases: { push: { action: 'unban', moderatorId: mod.id, reason, timestamp: new Date() } } },
        create: { userId: targetId, guildId, cases: [{ action: 'unban', moderatorId: mod.id, reason, timestamp: new Date() }] },
      }).catch(() => null);

      const embed = new EmbedBuilder()
        .setColor(PALETTE.success)
        .setAuthor({ name: `${KIT.mod} User Unbanned — ${ban.user.username}`, iconURL: ban.user.displayAvatarURL({ size: 64 }) })
        .addFields(
          { name: '✅ Unbanned', value: `<@${targetId}> \`${targetId}\``, inline: true },
          { name: '👮 Moderator', value: `<@${mod.id}>`, inline: true },
          { name: '📋 Reason', value: reason, inline: false },
        )
        .setFooter({ text: 'Panindigan Moderation' }).setTimestamp();

      if (interaction) await interaction.reply({ embeds: [embed] });
      else await message!.reply({ embeds: [embed] });
    } catch {
      const err = errorEmbed('Unban Failed', 'Failed to unban the user. Check my permissions.');
      if (interaction) await interaction.reply({ embeds: [err], ephemeral: true });
      else await message!.reply({ embeds: [err] });
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    await this.run(interaction, null, target.id, interaction.user, reason, interaction.guild!.id);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const targetId = message.mentions.users.first()?.id ?? args[0];
    if (!targetId) return void message.reply({ embeds: [errorEmbed('No User', 'Please provide a user ID or mention.')] });
    const reason = args.slice(1).join(' ') || 'No reason provided';
    await this.run(null, message, targetId, message.author, reason, message.guild!.id);
  }
}
export default UnbanCommand;

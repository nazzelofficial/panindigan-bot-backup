// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';
import config from '../../../config.json' with { type: 'json' };

export class PurgeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'purge', description: 'Bulk-delete messages from the current channel', category: 'moderation',
      cooldown: 5, userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['clear', 'clean', 'prune'], examples: ['/purge 50', 'p!purge 100'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1–1000)').setMinValue(1).setMaxValue(1000).setRequired(true))
      .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(
    interaction: ChatInputCommandInteraction | null, message: Message | null,
    amount: number, filterUser: any, mod: any,
  ): Promise<void> {
    const max = config.moderation?.maxPurgeAmount ?? 1000;
    if (amount > max) amount = max;

    const channel = interaction?.channel ?? message!.channel;
    if (!channel?.isTextBased()) return;

    try {
      if (interaction) await interaction.deferReply({ ephemeral: true });

      let deleted = 0;
      let remaining = amount;

      while (remaining > 0) {
        const batch = Math.min(remaining, 100);
        const fetched = await channel.messages.fetch({ limit: batch });

        let toDelete = fetched;
        if (filterUser) toDelete = fetched.filter(m => m.author.id === filterUser.id);

        // Discord only allows bulk-delete for messages <14 days old
        const deletable = toDelete.filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
        if (deletable.size === 0) break;

        const result = await channel.bulkDelete(deletable, true);
        deleted += result.size;
        remaining -= batch;
        if (fetched.size < batch) break;
      }

      const embed = new EmbedBuilder()
        .setColor(PALETTE.success)
        .setAuthor({ name: `${KIT.mod} Messages Purged`, iconURL: mod.displayAvatarURL?.({ size: 64 }) })
        .addFields(
          { name: '🗑️ Deleted',   value: `**${deleted}** message${deleted !== 1 ? 's' : ''}`, inline: true },
          { name: '👮 Moderator', value: `<@${mod.id}>`, inline: true },
          ...(filterUser ? [{ name: '👤 Filtered To', value: `<@${filterUser.id}>`, inline: true }] : []),
          { name: '📅 Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        )
        .setFooter({ text: 'Panindigan Moderation  •  Note: messages >14 days old cannot be bulk-deleted' })
        .setTimestamp();

      if (interaction) await interaction.editReply({ embeds: [embed] });
      else {
        const reply = await message!.reply({ embeds: [embed] });
        setTimeout(() => reply.delete().catch(() => null), 8_000);
      }
    } catch (err) {
      const e = errorEmbed('Purge Failed', 'Failed to delete messages. Messages may be too old (>14 days).');
      if (interaction) await interaction.editReply({ embeds: [e] });
      else await message!.reply({ embeds: [e] });
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount     = interaction.options.getInteger('amount', true);
    const filterUser = interaction.options.getUser('user');
    await this.run(interaction, null, amount, filterUser, interaction.user);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const amount     = parseInt(args[0]) || 10;
    const filterUser = message.mentions.users.first() ?? null;
    await this.run(null, message, amount, filterUser, message.author);
  }
}
export default PurgeCommand;

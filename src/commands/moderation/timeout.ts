// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class TimeoutCommand extends BaseCommand {
  constructor() {
    super({
      name: 'timeout', description: 'Timeout (mute) a user for a specified duration', category: 'moderation',
      cooldown: 3, userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['mute', 'tempmute', 'to'],
      examples: ['/timeout @user 10m Spamming', 'p!timeout @user 1h Rule violation'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addUserOption(o => o.setName('target').setDescription('User to timeout').setRequired(true))
      .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d — max 28d)').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(
    interaction: ChatInputCommandInteraction | null, message: Message | null,
    target: any, mod: any, durationStr: string, reason: string, guildId: string,
  ): Promise<void> {
    const durationSec = Formatter.parseTime(durationStr);
    if (!durationSec || durationSec < 1)
      return void (interaction ?? message!).reply({
        embeds: [errorEmbed('Invalid Duration', 'Please provide a valid duration (e.g. `10m`, `1h`, `1d`, `28d` max).')],
        ephemeral: !!interaction,
      });

    const maxDuration = 28 * 24 * 60 * 60;
    if (durationSec > maxDuration)
      return void (interaction ?? message!).reply({
        embeds: [errorEmbed('Too Long', 'Discord limits timeouts to **28 days** maximum.')],
        ephemeral: !!interaction,
      });

    const guild = interaction?.guild ?? message!.guild!;
    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member)
      return void (interaction ?? message!).reply({ embeds: [errorEmbed('Not Found', 'That user is not in this server.')], ephemeral: !!interaction });
    if (!member.moderatable)
      return void (interaction ?? message!).reply({ embeds: [errorEmbed('Insufficient Permissions', "I cannot timeout this user — their role is higher than mine.")], ephemeral: !!interaction });

    try {
      await member.timeout(durationSec * 1000, reason);

      const prisma = getPrismaClient();
      await prisma.moderation.upsert({
        where: { userId_guildId: { userId: target.id, guildId } },
        update: { cases: { push: { action: 'timeout', moderatorId: mod.id, reason, timestamp: new Date() } } },
        create: { userId: target.id, guildId, cases: [{ action: 'timeout', moderatorId: mod.id, reason, timestamp: new Date() }] },
      }).catch(() => null);

      const expiresAt = Math.floor((Date.now() + durationSec * 1000) / 1000);
      const embed = new EmbedBuilder()
        .setColor(PALETTE.warning)
        .setAuthor({ name: `${KIT.mod} Timeout — ${target.username}`, iconURL: target.displayAvatarURL({ size: 64 }) })
        .addFields(
          { name: '🔇 Timed Out',   value: `<@${target.id}> \`${target.id}\``,    inline: true },
          { name: '👮 Moderator',   value: `<@${mod.id}>`,                         inline: true },
          { name: '⏱️ Duration',    value: `\`${durationStr}\``,                   inline: true },
          { name: '⏰ Expires',     value: `<t:${expiresAt}:R>`,                   inline: true },
          { name: '📋 Reason',      value: reason,                                 inline: false },
        )
        .setFooter({ text: 'Panindigan Moderation' }).setTimestamp();

      if (interaction) await interaction.reply({ embeds: [embed] });
      else await message!.reply({ embeds: [embed] });
    } catch {
      const err = errorEmbed('Timeout Failed', 'Failed to timeout the user. Check my permissions.');
      if (interaction) await interaction.reply({ embeds: [err], ephemeral: true });
      else await message!.reply({ embeds: [err] });
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target   = interaction.options.getUser('target', true);
    const duration = interaction.options.getString('duration', true);
    const reason   = interaction.options.getString('reason') ?? 'No reason provided';
    await this.run(interaction, null, target, interaction.user, duration, reason, interaction.guild!.id);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    if (!target) return void message.reply({ embeds: [errorEmbed('No User', 'Please mention a user to timeout.')] });
    const duration = args[1] ?? '10m';
    const reason   = args.slice(2).join(' ') || 'No reason provided';
    await this.run(null, message, target, message.author, duration, reason, message.guild!.id);
  }
}
export default TimeoutCommand;

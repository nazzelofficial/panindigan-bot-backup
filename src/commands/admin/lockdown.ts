// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, OverwriteType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class LockdownCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lockdown',
      description: 'Lock down the server by restricting channel permissions',
      category: 'admin',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lock', 'serverlock'],
      examples: ['/lockdown', 'p!lockdown'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.toggleLockdown(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.toggleLockdown(message);
  }

  private async toggleLockdown(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = await import('../../database/postgresql/client.js').then(m => m.getPrismaClient());
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const isLocked = guild?.isLockedDown || false;
    const newState = !isLocked;

    await interaction.deferReply();

    let successCount = 0;
    let failCount = 0;

    for (const channel of interaction.guild.channels.cache.values()) {
      if (!channel.isTextBased()) continue;

      try {
        if (newState) {
          await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false,
          });
        } else {
          await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null,
          });
        }
        successCount++;
      } catch {
        failCount++;
      }
    }

    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { isLockedDown: newState },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Lockdown ${newState ? 'Enabled' : 'Disabled'}`)
      .setColor(newState ? COLORS.warning : COLORS.success)
      .addFields([
        { name: 'Status', value: newState ? '🔒 Locked' : '🔓 Unlocked', inline: true },
        { name: 'Channels Updated', value: successCount.toString(), inline: true },
        { name: 'Failed', value: failCount.toString(), inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply({ embeds: [embed] });
    }
  }
}

export default LockdownCommand;

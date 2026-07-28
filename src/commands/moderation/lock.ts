// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';

export class LockCommand extends BaseCommand {
  constructor() {
    super({
      name: 'lock', description: 'Lock a channel to prevent members from sending messages', category: 'moderation',
      cooldown: 3, userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['close', 'lockdown'], examples: ['/lock', 'p!lock #general'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addChannelOption(o => o.setName('channel').setDescription('Channel to lock (defaults to current)').setRequired(false))
      .addStringOption(o => o.setName('reason').setDescription('Reason for locking').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(
    interaction: ChatInputCommandInteraction | null, message: Message | null,
    channel: any, mod: any, reason: string,
  ): Promise<void> {
    if (!channel?.isTextBased()) {
      const err = errorEmbed('Invalid Channel', 'Please provide a valid text channel.');
      if (interaction) return void interaction.reply({ embeds: [err], ephemeral: true });
      return void message!.reply({ embeds: [err] });
    }

    try {
      const guild = interaction?.guild ?? message!.guild!;
      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });

      const embed = new EmbedBuilder()
        .setColor(PALETTE.error)
        .setTitle(`${KIT.lock} Channel Locked`)
        .addFields(
          { name: '🔒 Channel',   value: `<#${channel.id}>`,           inline: true },
          { name: '👮 Moderator', value: `<@${mod.id}>`,               inline: true },
          { name: '📋 Reason',   value: reason,                        inline: false },
          { name: '📅 Locked',   value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
        )
        .setFooter({ text: 'Use /unlock to re-enable messaging' })
        .setTimestamp();

      if (interaction) await interaction.reply({ embeds: [embed] });
      else await message!.reply({ embeds: [embed] });
    } catch {
      const err = errorEmbed('Lock Failed', 'Failed to lock channel. Check my permissions.');
      if (interaction) await interaction.reply({ embeds: [err], ephemeral: true });
      else await message!.reply({ embeds: [err] });
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const reason  = interaction.options.getString('reason') ?? 'No reason provided';
    await this.run(interaction, null, channel, interaction.user, reason);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first() ?? message.channel;
    const reason  = args.slice(1).join(' ') || 'No reason provided';
    await this.run(null, message, channel, message.author, reason);
  }
}
export default LockCommand;

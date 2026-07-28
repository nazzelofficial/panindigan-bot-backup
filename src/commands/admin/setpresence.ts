// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, PresenceStatus } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SetPresenceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setpresence',
      description: 'Change the bot\'s online status (Owner only)',
      category: 'admin',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['presence', 'botpresence'],
      examples: ['/setpresence online', 'p!setpresence idle'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const status = interaction.options.getString('status') || 'online';

    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    if (!validStatuses.includes(status)) {
      await interaction.reply({ content: '❌ Status must be one of: online, idle, dnd, invisible', ephemeral: true });
      return;
    }

    try {
      await interaction.client.user.setStatus(status as PresenceStatus);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Presence Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Status', value: status, inline: true },
          { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to update presence.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const status = args[0]?.toLowerCase() || 'online';

    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    if (!validStatuses.includes(status)) {
      await message.reply('❌ Status must be one of: online, idle, dnd, invisible');
      return;
    }

    try {
      await message.client.user.setStatus(status as PresenceStatus);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Presence Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Status', value: status, inline: true },
          { name: 'Updated by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to update presence.');
    }
  }
}

export default SetPresenceCommand;

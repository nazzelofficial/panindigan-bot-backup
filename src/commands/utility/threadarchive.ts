import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ThreadChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ThreadarchiveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'threadarchive',
      description: 'Archive the current thread',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageThreads],
      botPermissions: [PermissionFlagsBits.ManageThreads],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['archivethread'],
      examples: ['/threadarchive', 'p!threadarchive'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel;

    if (!channel || !channel.isThread()) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not a Thread`)
        .setDescription('This command can only be used inside a thread.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const thread = channel as ThreadChannel;
    try {
      await thread.setArchived(true);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Thread Archived`)
        .setDescription(`Thread **${thread.name}** has been archived.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Archive Failed`)
        .setDescription('Could not archive this thread.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const channel = message.channel;

    if (!channel.isThread()) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not a Thread`)
        .setDescription('This command can only be used inside a thread.');
      await message.reply({ embeds: [embed] });
      return;
    }

    const thread = channel as ThreadChannel;
    try {
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Thread Archived`)
        .setDescription(`Thread **${thread.name}** has been archived.`)
        .setTimestamp();
      await message.reply({ embeds: [embed] });
      await thread.setArchived(true);
    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Archive Failed`)
        .setDescription('Could not archive this thread.');
      await message.reply({ embeds: [embed] });
    }
  }
}

export default ThreadarchiveCommand;

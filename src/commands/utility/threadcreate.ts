// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ThreadcreateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'threadcreate',
      description: 'Create a new thread in the current channel',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ManageThreads],
      botPermissions: [PermissionFlagsBits.ManageThreads],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['createthread', 'newthread'],
      examples: ['/threadcreate My New Thread', 'p!threadcreate discussion topic'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name', true);
    const channel = interaction.channel as TextChannel;

    if (!channel || !channel.threads) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Cannot Create Thread`)
        .setDescription('Threads cannot be created in this channel type.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      const thread = await channel.threads.create({ name, autoArchiveDuration: 1440 });
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Thread Created`)
        .setDescription(`Thread **${thread.name}** has been created!`)
        .addFields(
          { name: 'Thread', value: `${thread}`, inline: true },
          { name: 'Auto-Archive', value: '24 hours', inline: true },
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Failed to Create Thread`)
        .setDescription('An error occurred while creating the thread.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!threadcreate <name>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const name = args.join(' ');
    const channel = message.channel as TextChannel;

    if (!channel || !channel.threads) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Cannot Create Thread`)
        .setDescription('Threads cannot be created in this channel type.');
      await message.reply({ embeds: [embed] });
      return;
    }

    try {
      const thread = await channel.threads.create({ name, autoArchiveDuration: 1440 });
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Thread Created`)
        .setDescription(`Thread **${thread.name}** has been created!`)
        .addFields(
          { name: 'Thread', value: `${thread}`, inline: true },
          { name: 'Auto-Archive', value: '24 hours', inline: true },
        )
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Failed to Create Thread`)
        .setDescription('An error occurred while creating the thread.');
      await message.reply({ embeds: [embed] });
    }
  }
}

export default ThreadcreateCommand;

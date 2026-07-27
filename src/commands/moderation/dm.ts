// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class DmCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dm',
      description: 'Send a direct message to a user',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.Administrator],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['message', 'senddm'],
      examples: ['/dm @user Hello there!', 'p!dm @user Hello there!'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('target');
    const message = interaction.options.getString('message');

    if (!target) {
      await interaction.reply({ content: '❌ Please provide a user to DM.', ephemeral: true });
      return;
    }

    if (!message) {
      await interaction.reply({ content: '❌ Please provide a message to send.', ephemeral: true });
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle(`Message from ${interaction.guild.name}`)
        .setDescription(message)
        .setColor(COLORS.info)
        .setFooter({ text: `Sent by ${interaction.user.tag}` })
        .setTimestamp();

      await target.send({ embeds: [embed] });

      const replyEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Message Sent`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Recipient', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Message', value: message.substring(0, 1024), inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [replyEmbed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to send DM. User may have DMs disabled.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    const dmMessage = _args.slice(1).join(' ');

    if (!target) {
      await message.reply('❌ Please mention a user to DM.');
      return;
    }

    if (!dmMessage) {
      await message.reply('❌ Please provide a message to send.');
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle(`Message from ${message.guild.name}`)
        .setDescription(dmMessage)
        .setColor(COLORS.info)
        .setFooter({ text: `Sent by ${message.author.tag}` })
        .setTimestamp();

      await target.send({ embeds: [embed] });

      const replyEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Message Sent`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Recipient', value: `${target.tag} (${target.id})`, inline: true },
          { name: 'Message', value: dmMessage.substring(0, 1024), inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [replyEmbed] });
    } catch (error) {
      await message.reply('❌ Failed to send DM. User may have DMs disabled.');
    }
  }
}

export default DmCommand;

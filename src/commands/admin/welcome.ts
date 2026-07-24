import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class WelcomeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'welcome',
      description: 'Configure welcome messages for new members',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['welcomeset', 'setwelcome'],
      examples: ['/welcome #welcome-channel', 'p!welcome #welcome-channel'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message') || 'Welcome {user} to {server}!';

    if (!channel) {
      await interaction.reply({ content: '❌ Please provide a welcome channel.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { 
        welcomeChannelId: channel.id,
        welcomeMessage: message,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Welcome Settings Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Message', value: message.substring(0, 100), inline: true },
        { name: 'Variables', value: '{user}, {server}, {membercount}', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first();
    const welcomeMessage = args.slice(1).join(' ') || 'Welcome {user} to {server}!';

    if (!channel) {
      await message.reply('❌ Please mention a welcome channel.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { 
        welcomeChannelId: channel.id,
        welcomeMessage: welcomeMessage,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Welcome Settings Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Message', value: welcomeMessage.substring(0, 100), inline: true },
        { name: 'Variables', value: '{user}, {server}, {membercount}', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WelcomeCommand;

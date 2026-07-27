// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class IgnoreUserCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ignoreuser',
      description: 'Ignore commands from a specific user',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['userignore'],
      examples: ['/ignoreuser @user', 'p!ignoreuser @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');

    if (!user) {
      await interaction.reply({ content: '❌ Please provide a user to ignore.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const ignoredUsers = guild?.ignoredUsers || [];

    if (ignoredUsers.includes(user.id)) {
      await interaction.reply({ content: '❌ This user is already ignored.', ephemeral: true });
      return;
    }

    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { ignoredUsers: [...ignoredUsers, user.id] },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} User Ignored`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Ignored by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const user = message.mentions.users.first();

    if (!user) {
      await message.reply('❌ Please mention a user to ignore.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: message.guild.id },
    });

    const ignoredUsers = guild?.ignoredUsers || [];

    if (ignoredUsers.includes(user.id)) {
      await message.reply('❌ This user is already ignored.');
      return;
    }

    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { ignoredUsers: [...ignoredUsers, user.id] },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} User Ignored`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Ignored by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default IgnoreUserCommand;

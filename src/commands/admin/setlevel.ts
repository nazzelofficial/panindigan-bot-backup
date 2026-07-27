// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetLevelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setlevel',
      description: 'Set a user\'s level',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setlvl'],
      examples: ['/setlevel @user 10', 'p!setlevel @user 25'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const level = interaction.options.getInteger('level');

    if (!user) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (level === null || level < 0) {
      await interaction.reply({ content: '❌ Please provide a valid level (0 or greater).', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.user.upsert({
      where: { userId_guildId: { userId: user.id, guildId: interaction.guild.id } },
      update: { level },
      create: { userId: user.id, guildId: interaction.guild.id, level },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Level Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Level', value: level.toString(), inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const user = message.mentions.users.first();
    const level = parseInt(args[1]);

    if (!user) {
      await message.reply('❌ Please mention a user.');
      return;
    }

    if (isNaN(level) || level < 0) {
      await message.reply('❌ Please provide a valid level (0 or greater).');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.user.upsert({
      where: { userId_guildId: { userId: user.id, guildId: message.guild.id } },
      update: { level },
      create: { userId: user.id, guildId: message.guild.id, level },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Level Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Level', value: level.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetLevelCommand;

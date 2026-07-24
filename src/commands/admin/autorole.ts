import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class AutoRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'autorole',
      description: 'Configure automatic role assignment for new members',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['autoroleset', 'setautorole'],
      examples: ['/autorole @Member', 'p!autorole @Member'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role to assign automatically.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { autoRoleId: role.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Auto Role Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Role', value: role.toString(), inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const role = message.mentions.roles.first();

    if (!role) {
      await message.reply('❌ Please mention a role to assign automatically.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { autoRoleId: role.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Auto Role Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Role', value: role.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AutoRoleCommand;

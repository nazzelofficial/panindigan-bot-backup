import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SetModRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setmodrole',
      description: 'Set the moderator role for the server',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['modrole', 'setmoderator'],
      examples: ['/setmodrole @Moderator', 'p!setmodrole @Moderator'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { modRoleId: role.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Moderator Role Set`)
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
      await message.reply('❌ Please mention a role.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { modRoleId: role.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Moderator Role Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Role', value: role.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetModRoleCommand;

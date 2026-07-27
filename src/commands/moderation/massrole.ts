// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class MassRoleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'massrole',
      description: 'Add a role to all users without a specific role',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ManageRoles],
      botPermissions: [PermissionFlagsBits.ManageRoles],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['massaddrole'],
      examples: ['/massrole @role @excluded', 'p!massrole @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');
    const excludeRole = interaction.options.getRole('exclude');

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role to add.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const membersToRole = interaction.guild.members.cache.filter(m => 
      !m.user.bot && !m.roles.cache.has(role.id) && (!excludeRole || !m.roles.cache.has(excludeRole.id))
    );

    if (membersToRole.size === 0) {
      await interaction.reply({ content: '❌ No members to add role to.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    let added = 0;
    let failed = 0;

    for (const member of membersToRole.values()) {
      try {
        await member.roles.add(role);
        added++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Mass Role Add Complete`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Added', value: added.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToRole.size.toString(), inline: true },
        { name: 'Role', value: role.name, inline: false },
        { name: 'Moderator', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const role = message.mentions.roles.first();
    const excludeRole = message.mentions.roles.at(1);

    if (!role) {
      await message.reply('❌ Please mention a role to add.');
      return;
    }

    if (!message.guild) return;

    const membersToRole = message.guild.members.cache.filter(m => 
      !m.user.bot && !m.roles.cache.has(role.id) && (!excludeRole || !m.roles.cache.has(excludeRole.id))
    );

    if (membersToRole.size === 0) {
      await message.reply('❌ No members to add role to.');
      return;
    }

    await message.reply('Starting mass role add...');

    let added = 0;
    let failed = 0;

    for (const member of membersToRole.values()) {
      try {
        await member.roles.add(role);
        added++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Mass Role Add Complete`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Added', value: added.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToRole.size.toString(), inline: true },
        { name: 'Role', value: role.name, inline: false },
        { name: 'Moderator', value: message.author.tag, inline: false },
      ])
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

export default MassRoleCommand;

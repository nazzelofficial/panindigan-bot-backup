import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class KickAllCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kickall',
      description: 'Kick all users without a specific role',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['masskick'],
      examples: ['/kickall @role', 'p!kickall @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'Mass kick';

    if (!role) {
      await interaction.reply({ content: '❌ Please provide a role. Users WITH this role will NOT be kicked.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const membersToKick = interaction.guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(role.id));

    if (membersToKick.size === 0) {
      await interaction.reply({ content: '❌ No members to kick.', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    let kicked = 0;
    let failed = 0;

    for (const member of membersToKick.values()) {
      try {
        await member.kick(reason);
        kicked++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Mass Kick Complete`)
      .setColor(COLORS.warning)
      .addFields([
        { name: 'Kicked', value: kicked.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToKick.size.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const role = message.mentions.roles.first();
    const reason = args.slice(1).join(' ') || 'Mass kick';

    if (!role) {
      await message.reply('❌ Please mention a role. Users WITH this role will NOT be kicked.');
      return;
    }

    if (!message.guild) return;

    const membersToKick = message.guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(role.id));

    if (membersToKick.size === 0) {
      await message.reply('❌ No members to kick.');
      return;
    }

    await message.reply('Starting mass kick...');

    let kicked = 0;
    let failed = 0;

    for (const member of membersToKick.values()) {
      try {
        await member.kick(reason);
        kicked++;
      } catch {
        failed++;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Mass Kick Complete`)
      .setColor(COLORS.warning)
      .addFields([
        { name: 'Kicked', value: kicked.toString(), inline: true },
        { name: 'Failed', value: failed.toString(), inline: true },
        { name: 'Total', value: membersToKick.size.toString(), inline: true },
        { name: 'Moderator', value: message.author.tag, inline: false },
      ])
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

export default KickAllCommand;

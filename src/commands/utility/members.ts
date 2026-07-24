import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PresenceStatus } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class MembersCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'members',
      description: 'Display member statistics for the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/members', 'p!members'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const totalMembers = guild.memberCount;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offline = guild.members.cache.filter(m => !m.presence || m.presence.status === 'offline').size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Member Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Total Members', value: Formatter.formatNumber(totalMembers), inline: true },
        { name: 'Humans', value: Formatter.formatNumber(humans), inline: true },
        { name: 'Bots', value: Formatter.formatNumber(bots), inline: true },
        { name: '🟢 Online', value: Formatter.formatNumber(online), inline: true },
        { name: '🌙 Idle', value: Formatter.formatNumber(idle), inline: true },
        { name: '⛔ DND', value: Formatter.formatNumber(dnd), inline: true },
        { name: '⚫ Offline', value: Formatter.formatNumber(offline), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const totalMembers = guild.memberCount;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offline = guild.members.cache.filter(m => !m.presence || m.presence.status === 'offline').size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = totalMembers - bots;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Member Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Total Members', value: Formatter.formatNumber(totalMembers), inline: true },
        { name: 'Humans', value: Formatter.formatNumber(humans), inline: true },
        { name: 'Bots', value: Formatter.formatNumber(bots), inline: true },
        { name: '🟢 Online', value: Formatter.formatNumber(online), inline: true },
        { name: '🌙 Idle', value: Formatter.formatNumber(idle), inline: true },
        { name: '⛔ DND', value: Formatter.formatNumber(dnd), inline: true },
        { name: '⚫ Offline', value: Formatter.formatNumber(offline), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default MembersCommand;

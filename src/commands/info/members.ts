// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class MembersCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'members',
      description: 'Display member statistics for the server',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['memberstats', 'servermembers'],
      examples: ['/members', 'p!members'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const members = await guild.members.fetch();

    const online = members.filter(m => m.presence?.status === PresenceStatus.Online).size;
    const idle = members.filter(m => m.presence?.status === PresenceStatus.Idle).size;
    const dnd = members.filter(m => m.presence?.status === PresenceStatus.DoNotDisturb).size;
    const offline = members.filter(m => !m.presence || m.presence.status === PresenceStatus.Offline).size;
    const bots = members.filter(m => m.user.bot).size;
    const humans = members.filter(m => !m.user.bot).size;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Member Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Total Members', value: Formatter.formatNumber(members.size), inline: true },
        { name: 'Humans', value: Formatter.formatNumber(humans), inline: true },
        { name: 'Bots', value: Formatter.formatNumber(bots), inline: true },
        { name: 'Online', value: Formatter.formatNumber(online), inline: true },
        { name: 'Idle', value: Formatter.formatNumber(idle), inline: true },
        { name: 'Do Not Disturb', value: Formatter.formatNumber(dnd), inline: true },
        { name: 'Offline', value: Formatter.formatNumber(offline), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const members = await guild.members.fetch();

    const online = members.filter(m => m.presence?.status === PresenceStatus.Online).size;
    const idle = members.filter(m => m.presence?.status === PresenceStatus.Idle).size;
    const dnd = members.filter(m => m.presence?.status === PresenceStatus.DoNotDisturb).size;
    const offline = members.filter(m => !m.presence || m.presence.status === PresenceStatus.Offline).size;
    const bots = members.filter(m => m.user.bot).size;
    const humans = members.filter(m => !m.user.bot).size;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Member Statistics`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Total Members', value: Formatter.formatNumber(members.size), inline: true },
        { name: 'Humans', value: Formatter.formatNumber(humans), inline: true },
        { name: 'Bots', value: Formatter.formatNumber(bots), inline: true },
        { name: 'Online', value: Formatter.formatNumber(online), inline: true },
        { name: 'Idle', value: Formatter.formatNumber(idle), inline: true },
        { name: 'Do Not Disturb', value: Formatter.formatNumber(dnd), inline: true },
        { name: 'Offline', value: Formatter.formatNumber(offline), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default MembersCommand;

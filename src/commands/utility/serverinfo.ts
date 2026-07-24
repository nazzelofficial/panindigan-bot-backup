import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class ServerInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'serverinfo',
      description: 'Display information about the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['server', 'guildinfo'],
      examples: ['/serverinfo', 'p!serverinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const owner = await guild.fetchOwner();
    const createdAt = guild.createdAt.toLocaleString();
    const members = guild.memberCount;
    const channels = guild.channels.cache.size;
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;
    const verification = guild.verificationLevel;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guild.name} Information`)
      .setColor(COLORS.info)
      .setThumbnail(guild.iconURL())
      .addFields([
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Created', value: createdAt, inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(channels), inline: true },
        { name: 'Roles', value: Formatter.formatNumber(roles), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(emojis), inline: true },
        { name: 'Boosts', value: Formatter.formatNumber(boosts), inline: true },
        { name: 'Boost Level', value: `Level ${boostLevel}`, inline: true },
        { name: 'Verification', value: verification.toString(), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const owner = await guild.fetchOwner();
    const createdAt = guild.createdAt.toLocaleString();
    const members = guild.memberCount;
    const channels = guild.channels.cache.size;
    const roles = guild.roles.cache.size;
    const emojis = guild.emojis.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;
    const verification = guild.verificationLevel;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guild.name} Information`)
      .setColor(COLORS.info)
      .setThumbnail(guild.iconURL())
      .addFields([
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Created', value: createdAt, inline: true },
        { name: 'Members', value: Formatter.formatNumber(members), inline: true },
        { name: 'Channels', value: Formatter.formatNumber(channels), inline: true },
        { name: 'Roles', value: Formatter.formatNumber(roles), inline: true },
        { name: 'Emojis', value: Formatter.formatNumber(emojis), inline: true },
        { name: 'Boosts', value: Formatter.formatNumber(boosts), inline: true },
        { name: 'Boost Level', value: `Level ${boostLevel}`, inline: true },
        { name: 'Verification', value: verification.toString(), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ServerInfoCommand;

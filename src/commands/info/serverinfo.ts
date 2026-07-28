// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  ChannelType,
  Guild,
} from 'discord.js';
import { PALETTE, KIT, divider } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';

const VERIFY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Very High',
};

const BOOST_LABELS: Record<number, string> = {
  0: 'Level 0',
  1: 'Level 1 ⭐',
  2: 'Level 2 ⭐⭐',
  3: 'Level 3 ⭐⭐⭐',
};

export class ServerInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'serverinfo',
      description: 'Display detailed information about this server',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['si', 'guildinfo', 'server'],
      examples: ['/serverinfo', 'p!serverinfo'],
    };
    super(options);
  }

  private async buildEmbed(guild: Guild): Promise<EmbedBuilder> {
    const owner = await guild.fetchOwner().catch(() => null);
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humans = guild.memberCount - bots;

    const textChannels  = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories    = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const threads       = guild.channels.cache.filter(c =>
      c.type === ChannelType.PublicThread || c.type === ChannelType.PrivateThread,
    ).size;

    const createdTs = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;
    const createdRelative = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    return new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ size: 256 }) ?? undefined,
      })
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: `${KIT.server} General`, value: divider(), inline: false },
        { name: '🆔 Server ID',      value: `\`${guild.id}\``,                         inline: true },
        { name: '👑 Owner',           value: owner ? `${owner.user.username}` : 'Unknown', inline: true },
        { name: '📅 Created',         value: `${createdTs}\n${createdRelative}`,         inline: true },
        { name: `👥 Members`, value: divider(), inline: false },
        { name: '👥 Total',           value: Formatter.formatNumber(guild.memberCount),  inline: true },
        { name: '👤 Humans',          value: Formatter.formatNumber(humans),             inline: true },
        { name: '🤖 Bots',            value: Formatter.formatNumber(bots),               inline: true },
        { name: `💬 Channels`, value: divider(), inline: false },
        { name: '📝 Text',            value: Formatter.formatNumber(textChannels),       inline: true },
        { name: '🔊 Voice',           value: Formatter.formatNumber(voiceChannels),      inline: true },
        { name: '📁 Categories',      value: Formatter.formatNumber(categories),         inline: true },
        { name: `${KIT.star} Server`, value: divider(), inline: false },
        { name: '🎭 Roles',           value: Formatter.formatNumber(guild.roles.cache.size),   inline: true },
        { name: '😀 Emojis',          value: Formatter.formatNumber(guild.emojis.cache.size),  inline: true },
        { name: '🚀 Boosts',          value: `${guild.premiumSubscriptionCount ?? 0} (${BOOST_LABELS[guild.premiumTier] ?? 'Level 0'})`, inline: true },
        { name: '🔒 Verification',    value: VERIFY_LABELS[guild.verificationLevel] ?? 'Unknown', inline: true },
        { name: '🧵 Threads',         value: Formatter.formatNumber(threads),            inline: true },
        { name: '🌐 Locale',          value: guild.preferredLocale,                      inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) ?? null)
      .setFooter({ text: `Server ID: ${guild.id}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const embed = await this.buildEmbed(interaction.guild!);
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const embed = await this.buildEmbed(message.guild!);
    await message.reply({ embeds: [embed] });
  }
}

export default ServerInfoCommand;

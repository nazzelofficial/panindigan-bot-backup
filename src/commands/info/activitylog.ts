import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ActivityLogCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'activitylog',
      description: 'Display recent server activity statistics',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['activity', 'serveractivity'],
      examples: ['/activitylog', 'p!activitylog'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const guild = interaction.guild!;
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({ where: { guildId: guild.id } });

      // Gather live guild stats
      await guild.members.fetch();
      const totalMembers = guild.memberCount;
      const botCount = guild.members.cache.filter(m => m.user.bot).size;
      const humanCount = totalMembers - botCount;
      const onlineCount = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
      const channelCount = guild.channels.cache.size;
      const textChannels = guild.channels.cache.filter(c => c.isTextBased()).size;
      const voiceChannels = guild.channels.cache.filter(c => c.isVoiceBased()).size;
      const roleCount = guild.roles.cache.size;
      const emojiCount = guild.emojis.cache.size;
      const boostCount = guild.premiumSubscriptionCount || 0;
      const boostTier = guild.premiumTier;

      const embed = new EmbedBuilder()
        .setTitle(`📈 Activity Log — ${guild.name}`)
        .setColor(COLORS.info)
        .setThumbnail(guild.iconURL() || null)
        .addFields(
          { name: '👥 Members', value: `Total: **${totalMembers}**\nHumans: **${humanCount}** | Bots: **${botCount}**\nOnline: **${onlineCount}**`, inline: true },
          { name: '📂 Channels', value: `Total: **${channelCount}**\nText: **${textChannels}** | Voice: **${voiceChannels}**`, inline: true },
          { name: '🎭 Roles', value: `**${roleCount}** roles`, inline: true },
          { name: '😀 Emojis', value: `**${emojiCount}** custom emojis`, inline: true },
          { name: '🚀 Boosts', value: `**${boostCount}** boosts (Tier ${boostTier})`, inline: true },
          { name: '📅 Server Age', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: `Server ID: ${guild.id}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch activity log.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const guild = message.guild!;
    await guild.members.fetch().catch(() => {});
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const embed = new EmbedBuilder()
      .setTitle(`📈 Activity Log — ${guild.name}`)
      .setColor(COLORS.info)
      .addFields(
        { name: '👥 Members', value: `Total: **${totalMembers}** | Humans: **${totalMembers - botCount}** | Bots: **${botCount}**`, inline: false },
        { name: '📂 Channels', value: `**${guild.channels.cache.size}** channels`, inline: true },
        { name: '🎭 Roles', value: `**${guild.roles.cache.size}** roles`, inline: true },
        { name: '🚀 Boosts', value: `**${guild.premiumSubscriptionCount || 0}** (Tier ${guild.premiumTier})`, inline: true },
      )
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default ActivityLogCommand;

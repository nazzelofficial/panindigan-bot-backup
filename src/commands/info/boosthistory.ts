// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class BoostHistoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'boosthistory',
      description: 'Show current server boost information',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boosts', 'boosters'],
      examples: ['/boosthistory', 'p!boosthistory'],
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
    const guild = interaction.guild!;
    await guild.members.fetch().catch(() => {});
    const boosters = guild.members.cache.filter(m => m.premiumSince !== null).sort((a, b) =>
      (a.premiumSince?.getTime() || 0) - (b.premiumSince?.getTime() || 0)
    );
    const embed = new EmbedBuilder()
      .setTitle(`🚀 Server Boosts — ${guild.name}`)
      .setColor(0xff73fa)
      .addFields(
        { name: '📊 Boost Stats', value: [
          `**Tier:** ${guild.premiumTier}`,
          `**Total Boosts:** ${guild.premiumSubscriptionCount || 0}`,
          `**Boosters:** ${boosters.size}`,
        ].join('\n'), inline: false },
        {
          name: '🌟 Current Boosters',
          value: boosters.size
            ? boosters.map(m => `<@${m.id}> — since <t:${Math.floor((m.premiumSince?.getTime() || 0) / 1000)}:R>`).slice(0, 15).join('\n').slice(0, 1024)
            : 'No current boosters.',
          inline: false
        }
      )
      .setThumbnail(guild.iconURL() || null)
      .setFooter({ text: 'Boost to unlock perks!' })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const guild = message.guild!;
    await guild.members.fetch().catch(() => {});
    const boosters = guild.members.cache.filter(m => m.premiumSince !== null);
    const embed = new EmbedBuilder()
      .setTitle(`🚀 Server Boosts — ${guild.name}`)
      .setColor(0xff73fa)
      .addFields(
        { name: '📊 Stats', value: `Tier **${guild.premiumTier}** • **${guild.premiumSubscriptionCount || 0}** boosts • **${boosters.size}** boosters`, inline: false }
      )
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default BoostHistoryCommand;

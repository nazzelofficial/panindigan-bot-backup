// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GuildInfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'guildinfo',
      description: 'Shows detailed info about a guild',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['serverinfo', 'ginfo'],
      examples: ['p!guildinfo 123456789'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!guildinfo <guildId>` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const guildId = args[0];
      if (!guildId) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.')] });
        return;
      }

      const guild = m.client.guilds.cache.get(guildId);
      if (!guild) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Guild \`${guildId}\` not found in cache.`)] });
        return;
      }

      let ownerTag = 'Unknown';
      try {
        const owner = await m.client.users.fetch(guild.ownerId);
        ownerTag = `${owner.tag} (${owner.id})`;
      } catch (_) { /* ignore */ }

      const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

      const embed = new EmbedBuilder()
        .setTitle(`🏠 Guild Info — ${guild.name}`)
        .setColor(COLORS.default)
        .setThumbnail(guild.iconURL() ?? null)
        .addFields(
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Owner', value: ownerTag, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
          { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
          { name: 'Premium Tier', value: `${guild.premiumTier}`, inline: true },
          { name: 'Boosts', value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true },
          { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
          { name: 'Created', value: createdAt, inline: false },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default GuildInfoCommand;

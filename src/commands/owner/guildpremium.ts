// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const VALID_TIERS = ['free', 'bronze', 'silver', 'gold', 'diamond'];

export class GuildPremiumCommand extends BaseCommand {
  constructor() {
    super({
      name: 'guildpremium',
      description: 'Set premium tier for a guild',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['gpremium', 'setguildpremium'],
      examples: ['p!guildpremium 123456789 gold'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!guildpremium <guildId> <tier>` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const [guildId, tier] = _args;
      if (!guildId || !tier) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Usage: \`p!guildpremium <guildId> <tier>\`\nTiers: ${VALID_TIERS.join(', ')}`)] });
        return;
      }

      if (!VALID_TIERS.includes(tier.toLowerCase())) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Invalid tier. Valid: ${VALID_TIERS.join(', ')}`)] });
        return;
      }

      const prisma = getPrismaClient();

      await (prisma as any).guild.upsert({
        where: { id: guildId },
        create: { id: guildId, premiumTier: tier.toLowerCase() },
        update: { premiumTier: tier.toLowerCase() },
      });

      const guild = m.client.guilds.cache.get(guildId);
      const guildName = guild?.name ?? guildId;

      const embed = new EmbedBuilder()
        .setTitle('💎 Guild Premium Updated')
        .setColor(COLORS.gold)
        .addFields(
          { name: 'Guild', value: `${guildName} (\`${guildId}\`)`, inline: true },
          { name: 'New Tier', value: tier.toLowerCase(), inline: true },
          { name: 'Set By', value: m.author.tag, inline: true },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default GuildPremiumCommand;

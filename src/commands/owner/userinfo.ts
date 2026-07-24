import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, UserFlags } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class OwnerUserInfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'owneruserinfo',
      description: 'Fetch detailed info about any user by ID (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['oui', 'ouserinfo'],
      examples: ['p!owneruserinfo 123456789'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!owneruserinfo <userId>` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const userId = args[0]?.replace(/[<@!>]/g, '');
      if (!userId) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a user ID.')] });
        return;
      }

      const user = await m.client.users.fetch(userId, { force: true });
      const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
      const accountAgeDays = Math.floor((Date.now() - user.createdTimestamp) / 86400000);

      const flagNames: string[] = [];
      if (user.flags) {
        const flags = user.flags.toArray();
        flagNames.push(...flags.map((f: string) => f.replace(/_/g, ' ')));
      }

      const prisma = getPrismaClient();
      let dbWallet = 'N/A';
      let dbPremium = 'N/A';
      let dbCases = 'N/A';

      try {
        const economy = await (prisma as any).economy.findFirst({ where: { userId } });
        const premium = await (prisma as any).premium.findFirst({ where: { userId } });
        const cases = await (prisma as any).moderation?.count?.({ where: { targetId: userId } });
        dbWallet = economy ? `${economy.wallet ?? 0}` : '0';
        dbPremium = premium?.tier ?? 'free';
        dbCases = `${cases ?? 0}`;
      } catch (_) { /* DB fields may not exist */ }

      const embed = new EmbedBuilder()
        .setTitle(`👤 User Info — ${user.tag}`)
        .setColor(COLORS.default)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Username', value: user.tag, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: createdAt, inline: false },
          { name: 'Account Age', value: `${accountAgeDays} days`, inline: true },
          { name: 'Flags', value: flagNames.length > 0 ? flagNames.join(', ') : 'None', inline: false },
          { name: '💰 Wallet', value: dbWallet, inline: true },
          { name: '💎 Premium', value: dbPremium, inline: true },
          { name: '⚖️ Mod Cases', value: dbCases, inline: true },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default OwnerUserInfoCommand;

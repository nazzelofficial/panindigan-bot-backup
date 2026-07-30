// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder,
} from 'discord.js';
import { DashboardUI } from '../../structures/DashboardUI.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { PremiumHandler } from '../../handlers/PremiumHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const TIER_INFO = {
  free:    { label: 'Free',    color: COLORS.default, perks: ['Basic commands', 'Economy system', 'Social GIFs', 'Leveling', 'Giveaways'] },
  bronze:  { label: 'Bronze',  color: COLORS.bronze,  perks: ['Everything in Free', 'Level roles', 'Starboard', 'Custom prefix', 'Economy boosts'] },
  silver:  { label: 'Silver',  color: COLORS.info,    perks: ['Everything in Bronze', 'Reputation system', 'Applications', 'Custom rank cards', '50 AI messages/day'] },
  gold:    { label: 'Gold',    color: COLORS.gold,    perks: ['Everything in Silver', 'Advanced AI (GPT-4)', 'DALL·E image gen', '200 AI messages/day', 'Priority support'] },
  diamond: { label: 'Diamond', color: COLORS.diamond, perks: ['Everything in Gold', 'Unlimited AI', 'Custom branding', 'Multi-server', 'Direct dev access'] },
};

export class PremiumCommand extends BaseCommand {
  constructor() {
    super({ name: 'premium', description: 'View, activate, or manage your premium subscription', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['sub', 'subscription', 'plan'], examples: ['/premium info', '/premium activate <key>', '/premium trial', '/premium tiers'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('info').setDescription('View your current premium status'))
      .addSubcommand(s => s.setName('tiers').setDescription('View all premium tiers and perks'))
      .addSubcommand(s => s.setName('activate').setDescription('Activate a premium key').addStringOption(o => o.setName('key').setDescription('Your premium key').setRequired(true)))
      .addSubcommand(s => s.setName('trial').setDescription('Start a free trial (Bronze, 7 days)'))
      .addSubcommand(s => s.setName('gift').setDescription('Gift premium to another user').addUserOption(o => o.setName('user').setDescription('User to gift').setRequired(true)).addStringOption(o => o.setName('tier').setDescription('Tier to gift').setRequired(true).addChoices(...Object.keys(TIER_INFO).filter(t=>t!=='free').map(v=>({name:TIER_INFO[v as keyof typeof TIER_INFO].label,value:v})))))
      ) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const handler = new PremiumHandler();

    if (sub === 'info') {
      await i.deferReply({ ephemeral: true });
      const status = await handler.getUserPremiumStatus(i.user.id);
      const tier = status?.tier || 'free';
      const info = TIER_INFO[tier as keyof typeof TIER_INFO] || TIER_INFO.free;
      const embed = DashboardUI.createPremium(i.user.tag, {
        tier: tier,
        active: status?.active || false,
        expiresAt: status?.expiresAt ? new Date(status.expiresAt) : null,
        features: info.perks,
      });
      await i.editReply({ embeds: [embed] });

    } else if (sub === 'tiers') {
      const embed = EmbedManager.premium('💎 Premium Tiers', 'Upgrade to unlock more features!');
      for (const [key, info] of Object.entries(TIER_INFO)) {
        embed.addFields({ name: `${info.label}`, value: info.perks.map(p => `• ${p}`).join('\n'), inline: true });
      }
      await i.reply({ embeds: [embed] });

    } else if (sub === 'activate') {
      await i.deferReply({ ephemeral: true });
      const key = i.options.getString('key', true);
      const result = await handler.activateKey(i.user.id, key);
      if (result.success) {
        await SuccessHandler.premium(i, result.tier || 'Bronze', TIER_INFO[result.tier as keyof typeof TIER_INFO]?.perks || []);
      } else {
        await ErrorHandler.generic(i, new Error(result.error || 'Failed to activate premium'));
      }

    } else if (sub === 'trial') {
      await i.deferReply({ ephemeral: true });
      const result = await handler.activateFreeTrial(i.user.id, 'bronze');
      if (result.success) {
        await SuccessHandler.premium(i, 'Bronze', TIER_INFO.bronze.perks);
      } else {
        await ErrorHandler.generic(i, new Error(result.error || 'Failed to activate trial'));
      }

    } else if (sub === 'gift') {
      await i.deferReply({ ephemeral: true });
      const target = i.options.getUser('user', true);
      const tier = i.options.getString('tier', true);
      // Check if giver has premium
      const giverStatus = await handler.getUserPremiumStatus(i.user.id);
      if (!giverStatus?.active || giverStatus.tier === 'free') {
        await ErrorHandler.generic(i, new Error('You need an active premium subscription to gift premium.')); return;
      }
      // Apply gift
      await handler.setUserPremium(target.id, tier, 30); // 30 days
      await SuccessHandler.premium(i, TIER_INFO[tier as keyof typeof TIER_INFO]?.label || tier, TIER_INFO[tier as keyof typeof TIER_INFO]?.perks || []);
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const [sub] = _args;
    if (!sub || sub === 'info') {
      const handler = new PremiumHandler();
      const status = await handler.getUserPremiumStatus(m.author.id);
      const tier = status?.tier || 'free';
      const info = TIER_INFO[tier as keyof typeof TIER_INFO] || TIER_INFO.free;
      const embed = DashboardUI.createPremium(m.author.tag, {
        tier: tier,
        active: status?.active || false,
        expiresAt: status?.expiresAt ? new Date(status.expiresAt) : null,
        features: info.perks,
      });
      await m.reply({ embeds: [embed] });
    } else {
      await m.reply('Please use `/premium` slash commands for full options.');
    }
  }
}
export default PremiumCommand;

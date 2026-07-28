// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { PremiumHandler } from '../../handlers/PremiumHandler.js';

const TIERS = ['free', 'bronze', 'silver', 'gold', 'diamond'];

export class SetPremiumCommand extends BaseCommand {
  constructor() {
    super({ name: 'setpremium', description: 'Manually set a user\'s premium tier (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['givepremium', 'forcepremium'], examples: ['p!setpremium @user gold 30'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o => o.setName('tier').setDescription('Premium tier').setRequired(true).addChoices(...TIERS.map(t => ({ name: t, value: t }))))
      .addIntegerOption(o => o.setName('days').setDescription('Duration in days (0 = permanent)').setRequired(false).setMinValue(0))) as SlashCommandBuilder;
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user', true);
    const tier = i.options.getString('tier', true);
    const days = i.options.getInteger('days') ?? 30;
    const handler = new PremiumHandler();
    await handler.setUserPremium(target.id, tier, days || undefined);
    await i.reply({ content: `✅ Set **${target.tag}**'s premium to **${tier}** for ${days > 0 ? `${days} days` : 'permanently'}.`, ephemeral: true });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = m.mentions.users.first(); const tier = args[1]; const days = parseInt(args[2]) || 30;
    if (!target || !TIERS.includes(tier)) { await m.reply('❌ Usage: `p!setpremium @user <tier> [days]`'); return; }
    const handler = new PremiumHandler();
    await handler.setUserPremium(target.id, tier, days);
    await m.reply(`✅ Set **${target.tag}**'s premium to **${tier}** for **${days}** days.`);
  }
}
export default SetPremiumCommand;

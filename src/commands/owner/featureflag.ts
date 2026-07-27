// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class FeatureflagCommand extends BaseCommand {
  constructor() {
    super({ name: 'featureflag', description: 'Toggle a feature flag on/off', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ff', 'feature'], examples: ['p!featureflag music on', 'p!featureflag economy off'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, feature: string, state: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!feature || !state) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `featureflag <feature> <on|off>`'));
    const enabled = state.toLowerCase() === 'on' || state.toLowerCase() === 'true' || state === '1';
    const redis = getRedisClient();
    await redis.set(`feature:${feature}`, enabled ? 'true' : 'false');
    const embed = new EmbedBuilder()
      .setColor(enabled ? COLORS.success : COLORS.error)
      .setTitle(`🚩 Feature Flag: ${feature}`)
      .setDescription(`Feature \`${feature}\` is now **${enabled ? '🟢 ENABLED' : '🔴 DISABLED'}**.`);
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('feature', true), i.options.getString('state', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0], args[1]); }
}
export default FeatureflagCommand;

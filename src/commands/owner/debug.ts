// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class DebugCommand extends BaseCommand {
  constructor() {
    super({ name: 'debug', description: 'Toggle debug mode on/off', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['debugmode'], examples: ['p!debug'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    try {
      const redis = getRedisClient();
      const current = await redis.get('debug:enabled');
      const newState = current === 'true' ? 'false' : 'true';
      await redis.set('debug:enabled', newState);
      const embed = new EmbedBuilder().setColor(newState === 'true' ? COLORS.success : COLORS.error)
        .setTitle(`🔧 Debug Mode: ${newState === 'true' ? '🟢 ON' : '🔴 OFF'}`)
        .setDescription(`Debug mode has been **${newState === 'true' ? 'enabled' : 'disabled'}**.\n${newState === 'true' ? 'Extra logs will be written to console.' : 'Normal logging resumed.'}`);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default DebugCommand;

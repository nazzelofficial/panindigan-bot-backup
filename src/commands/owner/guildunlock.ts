import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getRedisClient from '../../database/redis/client';

export class GuildunlockCommand extends BaseCommand {
  constructor() {
    super({ name: 'guildunlock', description: 'Unlock a guild from maintenance mode', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['gulk'], examples: ['p!guildunlock 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, guildId: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!guildId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
    const redis = getRedisClient();
    await redis.del(`guild:locked:${guildId}`);
    await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🔓 Guild Unlocked').setDescription(`Guild \`${guildId}\` is now unlocked and fully operational.`));
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('guild_id', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default GuildunlockCommand;

// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class RedisttlCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisttl',
      description: 'Show remaining TTL of a Redis key',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rttl'],
      examples: ['p!redisttl maintenance:enabled'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, key: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (!key) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key name.'));
    try {
      const redis = getRedisClient();
      const ttl = await redis.ttl(key);
      let desc: string;
      if (ttl === -2) desc = '❌ Key does not exist.';
      else if (ttl === -1) desc = '♾️ Key has no expiry (persistent).';
      else desc = `⏱️ **${ttl} seconds** remaining (${Math.floor(ttl / 60)}m ${ttl % 60}s)`;
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`⏳ TTL: \`${key}\``).setDescription(desc));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('key', true));
  }
  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await this.run(null, message, args[0]);
  }
}
export default RedisttlCommand;

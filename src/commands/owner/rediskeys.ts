import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getRedisClient from '../../database/redis/client';

export class RediskeysCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rediskeys',
      description: 'List Redis keys matching a pattern',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rkeys'],
      examples: ['p!rediskeys maintenance:*', 'p!rediskeys *'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, pattern: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    try {
      const redis = getRedisClient();
      const keys: string[] = await redis.keys(pattern || '*');
      const limited = keys.slice(0, 25);
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`🔑 Redis Keys: \`${pattern || '*'}\``)
        .setDescription(limited.length ? limited.map(k => `\`${k}\``).join('\n') : 'No keys found.')
        .setFooter({ text: `Showing ${limited.length} of ${keys.length} keys` });
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('pattern') ?? '*');
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args[0] ?? '*');
  }
}
export default RediskeysCommand;

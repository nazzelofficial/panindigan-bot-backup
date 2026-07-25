import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getRedisClient from '../../database/redis/client';

export class RedisflushkeyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisflushkey',
      description: 'Delete a specific Redis key',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rdel'],
      examples: ['p!redisflushkey maintenance:enabled'],
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
      const deleted = await redis.del(key);
      const embed = new EmbedBuilder()
        .setColor(deleted ? COLORS.success : COLORS.error)
        .setTitle(deleted ? '✅ Key Deleted' : '❌ Key Not Found')
        .setDescription(`Key: \`${key}\`\nResult: ${deleted ? 'Deleted successfully' : 'Key does not exist'}`);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('key', true));
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args[0]);
  }
}
export default RedisflushkeyCommand;

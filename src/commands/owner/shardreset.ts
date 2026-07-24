import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ShardResetCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shardreset',
      description: 'Respawn one or all shards',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['shardrespawn'],
      examples: ['p!shardreset all', 'p!shardreset 0'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!shardreset` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const client = m.client as any;

      if (!client.shard) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No ShardingManager available.')] });
        return;
      }

      const target = args[0];
      if (!target) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a shard ID or `all`.')] });
        return;
      }

      const waiting = new EmbedBuilder().setColor(COLORS.warning).setDescription(`⏳ Respawning shard(s): **${target}**...`);
      await m.reply({ embeds: [waiting] });

      if (target.toLowerCase() === 'all') {
        await client.shard.respawnAll();
      } else {
        const shardId = parseInt(target);
        if (isNaN(shardId)) {
          await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid shard ID.')] });
          return;
        }
        await client.shard.respawn(shardId);
      }

      const embed = new EmbedBuilder()
        .setTitle('🔀 Shard Reset')
        .setColor(COLORS.success)
        .setDescription(`✅ Shard(s) **${target}** respawned successfully.`)
        .setTimestamp();

      await m.channel.send({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default ShardResetCommand;

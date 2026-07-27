// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GuildSendCommand extends BaseCommand {
  constructor() {
    super({
      name: 'guildsend',
      description: 'Send a message to a channel in any guild',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['gsend'],
      examples: ['p!guildsend 123456789 987654321 Hello world!'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!guildsend <guildId> <channelId> <message>` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      if (args.length < 3) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `p!guildsend <guildId> <channelId> <message...>`')] });
        return;
      }

      const [guildId, channelId, ...msgParts] = _args;
      const text = msgParts.join(' ');

      const guild = m.client.guilds.cache.get(guildId);
      if (!guild) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Guild \`${guildId}\` not found.`)] });
        return;
      }

      const channel = guild.channels.cache.get(channelId) as any;
      if (!channel || !channel.send) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Channel \`${channelId}\` not found or not sendable.`)] });
        return;
      }

      await channel.send(text);

      const embed = new EmbedBuilder()
        .setTitle('📨 Message Sent')
        .setColor(COLORS.success)
        .addFields(
          { name: 'Guild', value: `${guild.name} (\`${guild.id}\`)`, inline: true },
          { name: 'Channel', value: `#${channel.name} (\`${channel.id}\`)`, inline: true },
          { name: 'Message', value: text.slice(0, 1024), inline: false },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default GuildSendCommand;

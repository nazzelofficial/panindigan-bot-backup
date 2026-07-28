// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class UnpinCommand extends BaseCommand {
  constructor() {
    super({ name: 'unpin', description: 'Unpin a message from the current channel 📌', category: 'admin', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageMessages], botPermissions: [PermissionFlagsBits.ManageMessages], aliases: ['unpinmsg', 'unpinmessage'], examples: ['/unpin <message_id>', 'p!unpin <message_id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('message_id').setDescription('Message ID to unpin').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(channel: any, messageId: string, send: (c: any) => Promise<any>): Promise<void> {
    if (!channel?.isTextBased()) { await send({ content: '❌ This command must be used in a text channel.', ephemeral: true }); return; }

    try {
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg) { await send({ content: '❌ Message not found.', ephemeral: true }); return; }
      if (!msg.pinned) { await send({ content: '❌ This message is not pinned.', ephemeral: true }); return; }

      await msg.unpin();

      const embed = new EmbedBuilder()
        .setTitle('📌 Message Unpinned')
        .setDescription(`Successfully unpinned a message by **${msg.author.tag}**.\n\n[Jump to message](${msg.url})`)
        .setColor(COLORS.success)
        .setTimestamp();

      await send({ embeds: [embed], ephemeral: true });
    } catch (e: any) {
      await send({ content: `❌ Failed to unpin message: ${e.message || 'Unknown error'}`, ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.channel, i.options.getString('message_id', true), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!unpin <message_id>`'); return; }
    await this.handle(m.channel, args[0], (c) => m.reply(typeof c === 'string' ? c : c.content || c));
  }
}
export default UnpinCommand;

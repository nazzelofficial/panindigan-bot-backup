import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class PinCommand extends BaseCommand {
  constructor() {
    super({ name: 'pin', description: 'Pin a message in the current channel 📌', category: 'admin', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageMessages], botPermissions: [PermissionFlagsBits.ManageMessages], aliases: ['pinmsg', 'pinmessage'], examples: ['/pin <message_id>', 'p!pin <message_id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('message_id').setDescription('Message ID to pin').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(channel: any, messageId: string, send: (c: any) => Promise<any>): Promise<void> {
    if (!channel?.isTextBased()) { await send({ content: '❌ This command must be used in a text channel.', ephemeral: true }); return; }

    try {
      const msg = await channel.messages.fetch(messageId).catch(() => null);
      if (!msg) { await send({ content: '❌ Message not found. Make sure the ID is correct and the message is in this channel.', ephemeral: true }); return; }
      if (msg.pinned) { await send({ content: '❌ This message is already pinned.', ephemeral: true }); return; }

      await msg.pin();

      const embed = new EmbedBuilder()
        .setTitle('📌 Message Pinned')
        .setDescription(`Successfully pinned a message by **${msg.author.tag}**.\n\n[Jump to message](${msg.url})`)
        .setColor(COLORS.success)
        .setTimestamp();

      await send({ embeds: [embed], ephemeral: true });
    } catch (e: any) {
      await send({ content: `❌ Failed to pin message: ${e.message || 'Unknown error'}`, ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.channel, i.options.getString('message_id', true), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!pin <message_id>`'); return; }
    await this.handle(m.channel, args[0], (c) => m.reply(typeof c === 'string' ? c : c.content || c));
  }
}
export default PinCommand;

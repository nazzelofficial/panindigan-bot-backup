// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class QrCommand extends BaseCommand {
  constructor() {
    super({
      name: 'qr',
      description: 'Generate a QR code for any text or URL',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['qrcode'],
      examples: ['p!qr https://discord.com', 'p!qr Hello World'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('text').setDescription('Text or URL to encode into a QR code').setRequired(true)
      ) as SlashCommandBuilder;
  }

  private buildEmbed(text: string, user: string): EmbedBuilder {
    const encoded = encodeURIComponent(text);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} QR Code`)
      .setColor(COLORS.default)
      .setDescription(`QR code generated for:\n\`\`\`${text.length > 200 ? text.slice(0, 200) + '...' : text}\`\`\``)
      .setImage(qrUrl)
      .setFooter({ text: `Requested by ${user}` })
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const text = i.options.getString('text', true);
      await i.reply({ embeds: [this.buildEmbed(text, i.user.username)] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred generating the QR code.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const text = _args.join(' ');
      if (!text) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Please provide text or a URL to encode.\nExample: \`p!qr https://discord.com\``)] });
        return;
      }
      await m.reply({ embeds: [this.buildEmbed(text, m.author.username)] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred generating the QR code.`)] });
    }
  }
}

export default QrCommand;

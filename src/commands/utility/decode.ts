// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class DecodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'decode',
      description: 'Decode Base64 encoded text',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['base64decode', 'b64decode'],
      examples: ['/decode SGVsbG8gV29ybGQ=', 'p!decode SGVsbG8gV29ybGQ='],
    };
    super(options);
  }

  private buildEmbed(input: string, decoded: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${EMOJIS.utility} Base64 Decode`)
      .addFields(
        { name: 'Input (Base64)', value: `\`\`\`${input.length > 500 ? input.slice(0, 500) + '...' : input}\`\`\`` },
        { name: 'Decoded', value: `\`\`\`${decoded.length > 1000 ? decoded.slice(0, 1000) + '...' : decoded}\`\`\`` },
      )
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('base64', true);
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf8');
      await interaction.reply({ embeds: [this.buildEmbed(text, decoded)] });
    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Decode Failed`)
        .setDescription('The provided text is not valid Base64.');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!decode <base64_text>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const text = args.join(' ');
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf8');
      await message.reply({ embeds: [this.buildEmbed(text, decoded)] });
    } catch {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Decode Failed`)
        .setDescription('The provided text is not valid Base64.');
      await message.reply({ embeds: [embed] });
    }
  }
}

export default DecodeCommand;

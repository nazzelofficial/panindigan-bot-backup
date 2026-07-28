// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class EncodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'encode',
      description: 'Encode text to Base64',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['base64encode', 'b64encode'],
      examples: ['/encode Hello World', 'p!encode my secret text'],
    };
    super(options);
  }

  private buildEmbed(input: string, encoded: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${EMOJIS.utility} Base64 Encode`)
      .addFields(
        { name: 'Input', value: `\`\`\`${input.length > 500 ? input.slice(0, 500) + '...' : input}\`\`\`` },
        { name: 'Encoded', value: `\`\`\`${encoded.length > 1000 ? encoded.slice(0, 1000) + '...' : encoded}\`\`\`` },
      )
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const encoded = Buffer.from(text).toString('base64');
    await interaction.reply({ embeds: [this.buildEmbed(text, encoded)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!encode <text>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const text = args.join(' ');
    const encoded = Buffer.from(text).toString('base64');
    await message.reply({ embeds: [this.buildEmbed(text, encoded)] });
  }
}

export default EncodeCommand;

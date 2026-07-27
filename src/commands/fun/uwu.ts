// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class UwuCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uwu',
      description: 'UwUify your text',
      category: 'fun',
      premiumTier: 'free',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['uwuify', 'owo'],
      examples: ['/uwu text:hello world', 'p!uwu hello world'],
    };
    super(options);
  }

  private uwuExtras = ['uwu', 'owo', 'UwU', 'OwO', '(ꈍᴗꈍ)', '(⁄ ⁄•⁄ω⁄•⁄ ⁄)', '~', 'nyaa~', '>w<'];

  private uwuify(text: string): string {
    let result = text
      .replace(/r/g, 'w')
      .replace(/R/g, 'W')
      .replace(/l/g, 'w')
      .replace(/L/g, 'W')
      .replace(/n([aeiou])/g, 'ny$1')
      .replace(/N([aeiou])/g, 'Ny$1')
      .replace(/ove/g, 'uv')
      .replace(/th/g, 'd')
      .replace(/Th/g, 'D');

    // Add random uwu extras after sentences
    result = result.replace(/[.!?]/g, (match) => {
      const extra = this.uwuExtras[Math.floor(Math.random() * this.uwuExtras.length)];
      return `${match} ${extra}`;
    });

    // Add a random extra at the end if no punctuation
    if (!/[.!?]/.test(text)) {
      const extra = this.uwuExtras[Math.floor(Math.random() * this.uwuExtras.length)];
      result += ` ${extra}`;
    }

    return result;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const uwuified = this.uwuify(text);

    const embed = new EmbedBuilder()
      .setTitle('(ꈍᴗꈍ) UwU Text')
      .addFields(
        { name: 'Original', value: text },
        { name: 'UwUified', value: uwuified }
      )
      .setColor(COLORS.default)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Missing Text`)
        .setDescription('Please provide text to UwUify!\nUsage: `p!uwu <text>`')
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const text = _args.join(' ');
    const uwuified = this.uwuify(text);

    const embed = new EmbedBuilder()
      .setTitle('(ꈍᴗꈍ) UwU Text')
      .addFields(
        { name: 'Original', value: text },
        { name: 'UwUified', value: uwuified }
      )
      .setColor(COLORS.default)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UwuCommand;

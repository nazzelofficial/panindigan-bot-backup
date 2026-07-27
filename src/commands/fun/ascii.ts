// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class AsciiCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ascii',
      description: 'Convert text to ASCII block art',
      category: 'fun',
      premiumTier: 'silver',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['asciiart', 'blocktext'],
      examples: ['/ascii text:HELLO', 'p!ascii HELLO'],
    };
    super(options);
  }

  private letterMap: Record<string, string[]> = {
    A: [' ██ ', '████', '█  █', '████', '█  █'],
    B: ['███ ', '█  █', '███ ', '█  █', '███ '],
    C: [' ███', '█   ', '█   ', '█   ', ' ███'],
    D: ['███ ', '█  █', '█  █', '█  █', '███ '],
    E: ['████', '█   ', '███ ', '█   ', '████'],
    F: ['████', '█   ', '███ ', '█   ', '█   '],
    G: [' ███', '█   ', '█ ██', '█  █', ' ███'],
    H: ['█  █', '█  █', '████', '█  █', '█  █'],
    I: ['███', ' █ ', ' █ ', ' █ ', '███'],
    J: ['  █', '  █', '  █', '█ █', ' █ '],
    K: ['█  █', '█ █ ', '██  ', '█ █ ', '█  █'],
    L: ['█   ', '█   ', '█   ', '█   ', '████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
    P: ['███ ', '█  █', '███ ', '█   ', '█   '],
    Q: [' ██ ', '█  █', '█  █', '█ ██', ' ███'],
    R: ['███ ', '█  █', '███ ', '█ █ ', '█  █'],
    S: [' ███', '█   ', ' ██ ', '   █', '███ '],
    T: ['████', ' █  ', ' █  ', ' █  ', ' █  '],
    U: ['█  █', '█  █', '█  █', '█  █', ' ██ '],
    V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['████', '   █', '  █ ', ' █  ', '████'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
    '0': [' ██ ', '█  █', '█  █', '█  █', ' ██ '],
    '1': [' █ ', '██ ', ' █ ', ' █ ', '███'],
    '2': [' ██ ', '   █', '  █ ', ' █  ', '████'],
    '3': ['███ ', '   █', ' ██ ', '   █', '███ '],
    '4': ['█  █', '█  █', '████', '   █', '   █'],
    '5': ['████', '█   ', '███ ', '   █', '███ '],
    '6': [' ██ ', '█   ', '███ ', '█  █', ' ██ '],
    '7': ['████', '   █', '  █ ', ' █  ', '█   '],
    '8': [' ██ ', '█  █', ' ██ ', '█  █', ' ██ '],
    '9': [' ██ ', '█  █', ' ███', '   █', ' ██ '],
    '!': ['█', '█', '█', ' ', '█'],
    '?': [' ██ ', '   █', '  █ ', '    ', '  █ '],
  };

  private textToAscii(text: string): string {
    const upper = text.toUpperCase().slice(0, 10);
    const rows: string[] = ['', '', '', '', ''];
    for (const char of upper) {
      const art = this.letterMap[char] ?? this.letterMap[' '];
      for (let r = 0; r < 5; r++) {
        rows[r] += (art[r] ?? '   ') + ' ';
      }
    }
    return rows.join('\n');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const ascii = this.textToAscii(text);

    const embed = new EmbedBuilder()
      .setTitle('🔤 ASCII Art')
      .setDescription(`\`\`\`\n${ascii}\n\`\`\``)
      .setColor(COLORS.default)
      .setFooter({ text: `Input: ${text.slice(0, 10)}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Missing Text`)
        .setDescription('Please provide text to convert!\nUsage: `p!ascii <text>`')
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const text = _args.join(' ');
    const ascii = this.textToAscii(text);

    const embed = new EmbedBuilder()
      .setTitle('🔤 ASCII Art')
      .setDescription(`\`\`\`\n${ascii}\n\`\`\``)
      .setColor(COLORS.default)
      .setFooter({ text: `Input: ${text.slice(0, 10)}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AsciiCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const LINES = [
  'Are you a Discord server? Because I want to join you. 💌',
  'Are you a bot? Because you just automated my heart. 🤖❤️',
  'Is your name Wi-Fi? Because I\'m feeling a connection. 📶',
  'Are you a keyboard? Because you\'re just my type. ⌨️',
  'Do you have a map? I keep getting lost in your eyes. 🗺️',
  'Are you a camera? Every time I look at you, I smile. 📷',
  'Is it hot in here or is it just our chemistry? 🔬',
  'Are you a magnet? Because I\'m attracted to you. 🧲',
  'Do you have a BandAid? I scraped my knee falling for you. 🩹',
  'Are you Google? Because you have everything I\'ve been searching for. 🔍',
  'Hindi ko alam kung saan ka galing, pero siguradong langit. 👼',
  'Isa kang emoji na hindi available — isang puso sa mata. 😍',
  'Ikaw ba ang dahilan kung bakit hindi ako makatulog? Kasi lagi kitang naiisip. 🌙',
  'Kung ikaw ay bituin, ako na lang ang maniningala sa iyo habambuhay. ✨',
  'Mas maganda ka pa sa sunrise. At mas mahirap pang kalimutan. 🌅',
];

export class PickuplineCommand extends BaseCommand {
  constructor() {
    super({ name: 'pickupline', description: 'Get a curated romantic pickup line 💘', category: 'social', premiumTier: 'gold', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pickup', 'flirt', 'pul'], examples: ['/pickupline', '/pickupline @user', 'p!pickupline @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to flirt with').setRequired(false))) as SlashCommandBuilder;
  }

  private line() { return LINES[Math.floor(Math.random() * LINES.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user');
    const line = this.line();
    const desc = target ? `💘 **${i.user.username}** to **${target.username}**:\n\n*"${line}"*` : `💘 *"${line}"*`;
    await i.reply({ embeds: [new EmbedBuilder().setDescription(desc).setColor(0xff69b4).setFooter({ text: 'Panindigan Social' })] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first();
    const line = this.line();
    const desc = target ? `💘 **${m.author.username}** to **${target.username}**:\n\n*"${line}"*` : `💘 *"${line}"*`;
    await m.reply({ embeds: [new EmbedBuilder().setDescription(desc).setColor(0xff69b4).setFooter({ text: 'Panindigan Social' })] });
  }
}
export default PickuplineCommand;

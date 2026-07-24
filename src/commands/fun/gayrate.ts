import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GayrateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'gayrate',
      description: 'Check someone\'s gay rate percentage',
      category: 'fun',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gay', 'howgay'],
      examples: ['/gayrate', '/gayrate user:@someone', 'p!gayrate', 'p!gayrate @someone'],
    };
    super(options);
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private getRatingText(rate: number): string {
    if (rate < 10) return 'Not gay at all 🚫';
    if (rate < 25) return 'Slightly gay 🏳️‍🌈';
    if (rate < 50) return 'Kinda gay 🌈';
    if (rate < 75) return 'Pretty gay 🌈✨';
    if (rate < 90) return 'Very gay 🏳️‍🌈💖';
    return 'Maximum gay! 🌈🏳️‍🌈✨💖';
  }

  private buildEmbed(userId: string, displayName: string, avatarUrl: string | null): EmbedBuilder {
    const rate = this.hashUserId(userId) % 101;
    const bar = '█'.repeat(Math.floor(rate / 10)) + '░'.repeat(10 - Math.floor(rate / 10));
    const rating = this.getRatingText(rate);

    const embed = new EmbedBuilder()
      .setTitle('🏳️‍🌈 Gay Rate Meter')
      .setDescription(`**${displayName}** is **${rate}%** gay!\n\n\`[${bar}]\` ${rate}%\n\n**Rating:** ${rating}`)
      .setColor(0xff69b4)
      .setTimestamp();

    if (avatarUrl) embed.setThumbnail(avatarUrl);
    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.guild?.members.cache.get(target.id);
    const displayName = member?.displayName ?? target.username;
    const avatarUrl = target.displayAvatarURL();

    const embed = this.buildEmbed(target.id, displayName, avatarUrl);
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first() ?? message.author;
    const member = message.guild?.members.cache.get(target.id);
    const displayName = member?.displayName ?? target.username;
    const avatarUrl = target.displayAvatarURL();

    const embed = this.buildEmbed(target.id, displayName, avatarUrl);
    await message.reply({ embeds: [embed] });
  }
}

export default GayrateCommand;

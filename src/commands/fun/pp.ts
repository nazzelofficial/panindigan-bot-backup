import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, GuildMember } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PpCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pp',
      description: 'Measure PP size',
      category: 'fun',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ppsize', 'peepee'],
      examples: ['/pp', '/pp user:@someone', 'p!pp', 'p!pp @someone'],
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

  private getPpEmbed(userId: string, displayName: string, avatarUrl: string | null): EmbedBuilder {
    const size = this.hashUserId(userId) % 30;
    const bar = '8' + '='.repeat(size) + 'D';
    let rating: string;
    if (size < 5) rating = 'Tiny 😂';
    else if (size < 10) rating = 'Small 😅';
    else if (size < 15) rating = 'Average 😐';
    else if (size < 20) rating = 'Big 😮';
    else if (size < 25) rating = 'Huge 🤩';
    else rating = 'LEGENDARY 👑';

    const embed = new EmbedBuilder()
      .setTitle(`📏 PP Meter`)
      .setDescription(`**${displayName}'s PP size:**\n\`\`\`${bar}\`\`\`\n**Size:** ${size} inches\n**Rating:** ${rating}`)
      .setColor(COLORS.default)
      .setTimestamp();

    if (avatarUrl) embed.setThumbnail(avatarUrl);
    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.guild?.members.cache.get(target.id);
    const displayName = member?.displayName ?? target.username;
    const avatarUrl = target.displayAvatarURL();

    const embed = this.getPpEmbed(target.id, displayName, avatarUrl);
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const mention = message.mentions.users.first();
    const target = mention ?? message.author;
    const member = message.guild?.members.cache.get(target.id);
    const displayName = member?.displayName ?? target.username;
    const avatarUrl = target.displayAvatarURL();

    const embed = this.getPpEmbed(target.id, displayName, avatarUrl);
    await message.reply({ embeds: [embed] });
  }
}

export default PpCommand;

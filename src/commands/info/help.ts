import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HelpCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'help',
      description: 'Display help information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['commands', 'cmds'],
      examples: ['/help', '/help moderation', 'p!help moderation'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString('category') || '';

    if (category) {
      const categoryEmbed = this.createCategoryEmbed(category);
      await interaction.reply({ embeds: [categoryEmbed] });
    } else {
      const mainEmbed = this.createMainEmbed();
      await interaction.reply({ embeds: [mainEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const category = args[0] || '';

    if (category) {
      const categoryEmbed = this.createCategoryEmbed(category);
      await message.reply({ embeds: [categoryEmbed] });
    } else {
      const mainEmbed = this.createMainEmbed();
      await message.reply({ embeds: [mainEmbed] });
    }
  }

  private createMainEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Help Menu`)
      .setColor(COLORS.info)
      .setDescription('Use `/help <category>` to view commands in a specific category.')
      .addFields([
        { name: 'Categories', value: 'help, moderation, admin, music, economy, games, fun, ai, info, utility, social, leveling, giveaway, image, starboard, applications, premium, owner', inline: false },
        { name: 'Prefix', value: 'p!', inline: true },
        { name: 'Support', value: 'Join our support server for help', inline: true },
      ])
      .setTimestamp();
  }

  private createCategoryEmbed(category: string): EmbedBuilder {
    const commands: Record<string, string[]> = {
      help: ['help', 'ping', 'stats', 'botinfo'],
      moderation: ['ban', 'kick', 'mute', 'warn', 'purge'],
      admin: ['setup', 'config', 'settings'],
      music: ['play', 'skip', 'pause', 'queue', 'volume'],
      economy: ['balance', 'daily', 'work', 'shop', 'inventory'],
      games: ['coinflip', 'dice', 'slots', 'rps', 'trivia'],
      fun: ['meme', 'joke', '8ball', 'choose', 'roll'],
      ai: ['chat', 'ask', 'translate', 'summarize', 'code'],
      info: ['userinfo', 'serverinfo', 'roleinfo', 'avatar', 'ping'],
      utility: ['calc', 'translate', 'weather', 'remind', 'poll'],
      social: ['profile', 'rep', 'marry', 'divorce', 'level'],
      leveling: ['rank', 'leaderboard', 'xp'],
      giveaway: ['gstart', 'gend', 'greroll'],
      image: ['meme', 'cat', 'dog', 'avatar', 'banner'],
      starboard: ['starboard', 'star'],
      applications: ['apply', 'applications'],
      premium: ['premium', 'subscribe'],
      owner: ['eval', 'restart', 'shutdown'],
    };

    const categoryCommands = commands[category.toLowerCase()] || ['No commands found for this category'];

    return new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
      .setColor(COLORS.info)
      .setDescription(categoryCommands.join(', '))
      .setTimestamp();
  }
}

export default HelpCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LeaderboardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'leaderboard',
      description: 'Display the server leaderboard',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lb'],
      examples: ['/leaderboard', 'p!leaderboard'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏆 Server Leaderboard`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Leaderboard will be implemented with database integration.')
      .addFields([
        { name: 'Status', value: 'Database integration pending', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🏆 Server Leaderboard`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Leaderboard will be implemented with database integration.')
      .addFields([
        { name: 'Status', value: 'Database integration pending', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LeaderboardCommand;

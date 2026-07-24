import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LevelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'level',
      description: 'Display your level or another user\'s level',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/level', '/level @user', 'p!level'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Level: ${user.username}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Level information will be implemented with database integration.')
      .addFields([
        { name: 'Level', value: 'N/A', inline: true },
        { name: 'XP', value: 'N/A', inline: true },
        { name: 'XP to Next Level', value: 'N/A', inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Level: ${user.username}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Level information will be implemented with database integration.')
      .addFields([
        { name: 'Level', value: 'N/A', inline: true },
        { name: 'XP', value: 'N/A', inline: true },
        { name: 'XP to Next Level', value: 'N/A', inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LevelCommand;

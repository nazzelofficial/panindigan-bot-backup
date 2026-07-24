import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SnipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'snipe',
      description: 'Show the last deleted message in the channel',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/snipe', 'p!snipe'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Snipe`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Snipe functionality will be implemented with message deletion tracking.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Snipe`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Snipe functionality will be implemented with message deletion tracking.')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SnipeCommand;

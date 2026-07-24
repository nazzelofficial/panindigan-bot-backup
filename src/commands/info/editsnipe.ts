import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class EditSnipeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'editsnipe',
      description: 'Show the last edited message in the channel',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/editsnipe', 'p!editsnipe'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Edit Snipe`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Edit snipe functionality will be implemented with message edit tracking.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Edit Snipe`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Edit snipe functionality will be implemented with message edit tracking.')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default EditSnipeCommand;

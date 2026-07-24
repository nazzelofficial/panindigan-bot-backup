import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UrbanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'urban',
      description: 'Search Urban Dictionary for a term',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['urbandictionary', 'ud'],
      examples: ['/urban yeet', 'p!urban sus'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const term = interaction.options.getString('term') || '';
    if (!term) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a term to search.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📖 Urban Dictionary: ${term}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Urban Dictionary search will be implemented with the Urban Dictionary API.')
      .addFields([
        { name: 'Definition', value: 'N/A', inline: false },
        { name: 'Example', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const term = args.join(' ');

    if (!term) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a term to search.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📖 Urban Dictionary: ${term}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Urban Dictionary search will be implemented with the Urban Dictionary API.')
      .addFields([
        { name: 'Definition', value: 'N/A', inline: false },
        { name: 'Example', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UrbanCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RegionCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'region',
      description: 'Display the server region',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/region', 'p!region'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const region = guild.preferredLocale || 'Unknown';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌍 Server Region`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Preferred Locale', value: region, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const region = guild.preferredLocale || 'Unknown';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🌍 Server Region`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Preferred Locale', value: region, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RegionCommand;

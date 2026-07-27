// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class RegionCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'region',
      description: 'Display the server region',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['serverregion'],
      examples: ['/region', 'p!region'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Region`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Region', value: guild.preferredLocale || 'Unknown', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Region`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Region', value: guild.preferredLocale || 'Unknown', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RegionCommand;

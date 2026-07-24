import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class EmojisCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'emojis',
      description: 'List all emojis in the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/emojis', 'p!emojis'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const emojis = guild.emojis.cache;
    const animated = emojis.filter(e => e.animated).size;
    const staticEmojis = emojis.filter(e => !e.animated).size;
    const emojiList = emojis.map(e => `${e}`).join(' ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Emojis`)
      .setColor(COLORS.info)
      .setDescription(emojiList.slice(0, 4000) || 'No emojis')
      .addFields([
        { name: 'Total Emojis', value: Formatter.formatNumber(emojis.size), inline: true },
        { name: 'Animated', value: Formatter.formatNumber(animated), inline: true },
        { name: 'Static', value: Formatter.formatNumber(staticEmojis), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const emojis = guild.emojis.cache;
    const animated = emojis.filter(e => e.animated).size;
    const staticEmojis = emojis.filter(e => !e.animated).size;
    const emojiList = emojis.map(e => `${e}`).join(' ');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Emojis`)
      .setColor(COLORS.info)
      .setDescription(emojiList.slice(0, 4000) || 'No emojis')
      .addFields([
        { name: 'Total Emojis', value: Formatter.formatNumber(emojis.size), inline: true },
        { name: 'Animated', value: Formatter.formatNumber(animated), inline: true },
        { name: 'Static', value: Formatter.formatNumber(staticEmojis), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default EmojisCommand;

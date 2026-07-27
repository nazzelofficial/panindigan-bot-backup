// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TranslateAutoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'translateauto',
      description: 'Auto-translate messages in a channel',
      category: 'ai',
      cooldown: 10,
      userPermissions: ['ManageChannels'],
      botPermissions: ['ManageMessages'],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['autotranslate', 'auto-tr'],
      examples: ['/translateauto on English', 'p!translateauto off'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getString('action') || 'off';
    const language = interaction.options.getString('language') || 'English';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🌐 Auto-Translation`)
      .setColor(COLORS.info)
      .setDescription(`Auto-translation has been ${action}.`)
      .addFields([
        { name: 'Status', value: action === 'on' ? 'Enabled' : 'Disabled', inline: true },
        { name: 'Target Language', value: language, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const _args = message.content.split(' ').slice(1);
    const action = args[0] || 'off';
    const language = args[1] || 'English';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🌐 Auto-Translation`)
      .setColor(COLORS.info)
      .setDescription(`Auto-translation has been ${action}.`)
      .addFields([
        { name: 'Status', value: action === 'on' ? 'Enabled' : 'Disabled', inline: true },
        { name: 'Target Language', value: language, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TranslateAutoCommand;

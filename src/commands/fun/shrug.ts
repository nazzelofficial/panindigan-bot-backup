import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ShrugCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shrug',
      description: 'Shrug at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['idk'],
      examples: ['/shrug', 'p!shrug'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ¯\\_(ツ)_/¯ Shrug`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} shrugs ¯\\_(ツ)_/¯`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ¯\\_(ツ)_/¯ Shrug`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} shrugs ¯\\_(ツ)_/¯`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ShrugCommand;

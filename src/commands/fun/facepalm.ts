import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FacepalmCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'facepalm',
      description: 'Facepalm at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['palm'],
      examples: ['/facepalm', 'p!facepalm'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤦 Facepalm`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} facepalms 🤦‍♂️`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤦 Facepalm`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} facepalms 🤦‍♂️`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default FacepalmCommand;

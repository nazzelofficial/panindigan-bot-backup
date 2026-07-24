import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'cry',
      description: 'Cry (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['sob', 'tears'],
      examples: ['/cry', 'p!cry'],
    };
    super(options);
  }

  private cryMessages = [
    'cries 😢',
    'sobs uncontrollably 😭',
    'cries a river of tears 😢',
    'tears up 😢',
    'cries in the corner 😭',
    'weeps softly 😢',
    'cries dramatically 😭',
    'tears of sadness 😢',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.cryMessages[Math.floor(Math.random() * this.cryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😢 Cry`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const cryMessage = this.cryMessages[Math.floor(Math.random() * this.cryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😢 Cry`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${cryMessage}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CryCommand;

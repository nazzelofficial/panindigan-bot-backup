import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PokeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poke',
      description: 'Poke someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boop'],
      examples: ['/poke @user', 'p!poke @user'],
    };
    super(options);
  }

  private pokeMessages = [
    'pokes',
    'gives a gentle poke to',
    'pokes with their finger',
    'gives a playful poke to',
    'pokes curiously',
    'gives a mischievous poke to',
    'pokes with a stick',
    'gives a friendly poke to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.pokeMessages[Math.floor(Math.random() * this.pokeMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👉 Poke`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const pokeMessage = this.pokeMessages[Math.floor(Math.random() * this.pokeMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👉 Poke`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${pokeMessage} ${user}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PokeCommand;

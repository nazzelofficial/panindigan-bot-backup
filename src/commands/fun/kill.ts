import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class KillCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kill',
      description: 'Kill someone (fun - joke command)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['murder', 'eliminate'],
      examples: ['/kill @user', 'p!kill @user'],
    };
    super(options);
  }

  private killMethods = [
    'with a rubber chicken',
    'with a spoon',
    'with a banana',
    'with a pillow',
    'with a marshmallow',
    'with a nerf gun',
    'with confetti',
    'with glitter',
    'with a foam sword',
    'with a water balloon',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const method = this.killMethods[Math.floor(Math.random() * this.killMethods.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} 💀 Kill (Joke)`)
      .setColor(COLORS.error)
      .setDescription(`${interaction.user} killed ${user} ${method}!`)
      .addFields([
        { name: 'Victim', value: user.username, inline: true },
        { name: 'Method', value: method, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual harm occurred.', inline: false },
      ])
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const method = this.killMethods[Math.floor(Math.random() * this.killMethods.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} 💀 Kill (Joke)`)
      .setColor(COLORS.error)
      .setDescription(`${message.author} killed ${user} ${method}!`)
      .addFields([
        { name: 'Victim', value: user.username, inline: true },
        { name: 'Method', value: method, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual harm occurred.', inline: false },
      ])
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default KillCommand;

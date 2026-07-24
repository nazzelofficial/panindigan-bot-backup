import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class KickCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kick',
      description: 'Kick someone (fun - joke command)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['jokekick'],
      examples: ['/kick @user', 'p!kick @user'],
    };
    super(options);
  }

  private kickReasons = [
    'being too cool',
    'not sharing snacks',
    'being too awesome',
    'winning too much',
    'having too much fun',
    'being a legend',
    'being too popular',
    'making everyone laugh too hard',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const reason = this.kickReasons[Math.floor(Math.random() * this.kickReasons.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} 👟 Kicked!`)
      .setColor(COLORS.error)
      .setDescription(`${user} has been kicked for ${reason}!`)
      .addFields([
        { name: 'Kicked User', value: user.username, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual kick occurred.', inline: false },
      ])
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const reason = this.kickReasons[Math.floor(Math.random() * this.kickReasons.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} 👟 Kicked!`)
      .setColor(COLORS.error)
      .setDescription(`${user} has been kicked for ${reason}!`)
      .addFields([
        { name: 'Kicked User', value: user.username, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual kick occurred.', inline: false },
      ])
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default KickCommand;

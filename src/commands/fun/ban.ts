import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ban',
      description: 'Ban a user (fun - joke command)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['jokeban'],
      examples: ['/ban @user', 'p!ban @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const banReasons = [
      'being too awesome',
      'eating all the cookies',
      'not sharing the pizza',
      'being too cool for school',
      'hacking the mainframe',
      'stealing all the memes',
      'being a legend',
      'winning too much',
    ];
    const reason = banReasons[Math.floor(Math.random() * banReasons.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} BANNED!`)
      .setColor(COLORS.error)
      .setDescription(`${user} has been banned for ${reason}!`)
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .addFields([
        { name: 'Banned User', value: user.username, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual ban occurred.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const banReasons = [
      'being too awesome',
      'eating all the cookies',
      'not sharing the pizza',
      'being too cool for school',
      'hacking the mainframe',
      'stealing all the memes',
      'being a legend',
      'winning too much',
    ];
    const reason = banReasons[Math.floor(Math.random() * banReasons.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.error} BANNED!`)
      .setColor(COLORS.error)
      .setDescription(`${user} has been banned for ${reason}!`)
      .setImage('https://media.giphy.com/media/FEH8tvq2b2F8k/giphy.gif')
      .addFields([
        { name: 'Banned User', value: user.username, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Note', value: 'This is a joke command! No actual ban occurred.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BanCommand;

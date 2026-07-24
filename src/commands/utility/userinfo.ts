import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class UserInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'userinfo',
      description: 'Display information about a user',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['user', 'whois'],
      examples: ['/userinfo', '/userinfo @user', 'p!userinfo @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);
    
    const createdAt = user.createdAt.toLocaleString();
    const joinedAt = member?.joinedAt ? member.joinedAt.toLocaleString() : 'Not in server';
    const roles = member?.roles.cache.map(role => role.name).join(', ') || 'None';
    const nickname = member?.nickname || 'None';
    const isBot = user.bot ? 'Yes' : 'No';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.tag} Information`)
      .setColor(COLORS.info)
      .setThumbnail(user.displayAvatarURL())
      .addFields([
        { name: 'Username', value: user.username, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Nickname', value: nickname, inline: true },
        { name: 'Bot', value: isBot, inline: true },
        { name: 'Account Created', value: createdAt, inline: true },
        { name: 'Joined Server', value: joinedAt, inline: true },
        { name: 'Roles', value: roles.slice(0, 1000) || 'None', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild?.members.cache.get(user.id);
    
    const createdAt = user.createdAt.toLocaleString();
    const joinedAt = member?.joinedAt ? member.joinedAt.toLocaleString() : 'Not in server';
    const roles = member?.roles.cache.map(role => role.name).join(', ') || 'None';
    const nickname = member?.nickname || 'None';
    const isBot = user.bot ? 'Yes' : 'No';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.tag} Information`)
      .setColor(COLORS.info)
      .setThumbnail(user.displayAvatarURL())
      .addFields([
        { name: 'Username', value: user.username, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Nickname', value: nickname, inline: true },
        { name: 'Bot', value: isBot, inline: true },
        { name: 'Account Created', value: createdAt, inline: true },
        { name: 'Joined Server', value: joinedAt, inline: true },
        { name: 'Roles', value: roles.slice(0, 1000) || 'None', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UserInfoCommand;

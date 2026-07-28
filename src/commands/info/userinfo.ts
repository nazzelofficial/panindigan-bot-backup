// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  GuildMember,
  User,
  SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT, divider } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';

export class UserInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'userinfo',
      description: 'Display detailed information about a user',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ui', 'user', 'profile'],
      examples: ['/userinfo', '/userinfo @user', 'p!userinfo @user'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('The user to look up')
          .setRequired(false),
      ) as SlashCommandBuilder;
  }

  private buildEmbed(user: User, member: GuildMember | null): EmbedBuilder {
    const createdTs  = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;
    const createdRel = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;

    const embed = new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: `${KIT.user} Account`, value: divider(), inline: false },
        { name: '🆔 User ID',      value: `\`${user.id}\``,     inline: true },
        { name: '🤖 Bot',          value: user.bot ? 'Yes' : 'No', inline: true },
        { name: '📅 Created',      value: `${createdTs}\n${createdRel}`, inline: false },
      )
      .setTimestamp();

    if (member) {
      const joinedTs  = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Unknown';
      const joinedRel = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : '';

      const roles = member.roles.cache
        .filter(r => r.id !== member.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => `<@&${r.id}>`)
        .slice(0, 10)
        .join(' ');

      const topRole = member.roles.highest.id !== member.guild.id
        ? `<@&${member.roles.highest.id}>`
        : 'None';

      embed.addFields(
        { name: `${KIT.server} Server Member`, value: divider(), inline: false },
        { name: '📅 Joined',   value: `${joinedTs}\n${joinedRel}`,            inline: false },
        { name: '⭐ Top Role', value: topRole,                                 inline: true  },
        { name: '🎭 Roles',   value: roles || 'None',                         inline: false },
      );

      if (member.nickname) {
        embed.addFields({ name: '📛 Nickname', value: member.nickname, inline: true });
      }
    }

    embed.setFooter({ text: `User ID: ${user.id}` });
    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user   = interaction.options.getUser('user') ?? interaction.user;
    const member = (interaction.options.getMember('user') ??
      (user.id === interaction.user.id ? interaction.member : null)) as GuildMember | null;
    await interaction.reply({ embeds: [this.buildEmbed(user, member)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const user   = message.mentions.users.first() ?? message.author;
    const member = (message.mentions.members?.first() ??
      (user.id === message.author.id ? message.member : null)) as GuildMember | null;
    await message.reply({ embeds: [this.buildEmbed(user, member)] });
  }
}

export default UserInfoCommand;

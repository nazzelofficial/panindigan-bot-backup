// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from 'discord.js';
import { PALETTE, KIT } from '../../utils/EmbedSystem.js';

export class AvatarCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'avatar',
      description: "Display a user's avatar in full resolution",
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['av', 'pfp', 'icon'],
      examples: ['/avatar', '/avatar @user', 'p!avatar @user'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(opt =>
        opt.setName('user')
          .setDescription('The user whose avatar to display')
          .setRequired(false),
      ) as SlashCommandBuilder;
  }

  private buildEmbed(user: any, member: any): { embed: EmbedBuilder; row: ActionRowBuilder<ButtonBuilder> } {
    const globalUrl = user.displayAvatarURL({ size: 4096, extension: 'png' });
    const serverUrl = member?.avatar
      ? member.displayAvatarURL({ size: 4096, extension: 'png' })
      : null;

    const embed = new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setAuthor({ name: `${user.username}`, iconURL: globalUrl })
      .setTitle(`${KIT.user} Avatar`)
      .setImage(globalUrl)
      .setFooter({ text: 'Click the buttons below to switch or download' })
      .setTimestamp();

    if (serverUrl && serverUrl !== globalUrl) {
      embed.setDescription(`${KIT.dot} **Global avatar** shown above\n${KIT.dot} **Server avatar** available — use the button below`);
    }

    const buttons = [
      new ButtonBuilder()
        .setLabel('PNG')
        .setURL(user.displayAvatarURL({ size: 4096, extension: 'png' }))
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('WEBP')
        .setURL(user.displayAvatarURL({ size: 4096, extension: 'webp' }))
        .setStyle(ButtonStyle.Link),
    ];

    if (serverUrl && serverUrl !== globalUrl) {
      buttons.push(
        new ButtonBuilder()
          .setLabel('Server Avatar')
          .setURL(serverUrl)
          .setStyle(ButtonStyle.Link),
      );
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
    return { embed, row };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user   = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.options.getMember('user') ?? interaction.member;
    const { embed, row } = this.buildEmbed(user, member);
    await interaction.reply({ embeds: [embed], components: [row] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const user   = message.mentions.users.first() ?? message.author;
    const member = message.mentions.members?.first() ?? (user.id === message.author.id ? message.member : null);
    const { embed, row } = this.buildEmbed(user, member);
    await message.reply({ embeds: [embed], components: [row] });
  }
}

export default AvatarCommand;

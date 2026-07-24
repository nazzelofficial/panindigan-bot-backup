import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class IdCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'id',
      description: 'Display the ID of a user, channel, or role',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/id', '/id @user', 'p!id @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.options.getChannel('channel') || interaction.options.getRole('role') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ID Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: target instanceof Object && 'name' in target ? (target as any).name : (target as any).username, inline: true },
        { name: 'ID', value: target.id, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    let target: any = message.author;

    if (message.mentions.users.first()) {
      target = message.mentions.users.first();
    } else if (message.mentions.channels.first()) {
      target = message.mentions.channels.first();
    } else if (message.mentions.roles.first()) {
      target = message.mentions.roles.first();
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ID Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: target instanceof Object && 'name' in target ? target.name : target.username, inline: true },
        { name: 'ID', value: target.id, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default IdCommand;

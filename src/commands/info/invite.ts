// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class InviteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'invite',
      description: 'Get the bot invite link',
      category: 'info',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['addbot'],
      examples: ['/invite', 'p!invite'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Invite the Bot`)
      .setColor(COLORS.info)
      .setDescription('Add the bot to your server!')
      .addFields([
        { name: 'Invite Link', value: '[Invite Here](https://discord.com/oauth2/authorize)', inline: false },
        { name: 'Permissions', value: 'The bot requires basic permissions to function properly.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Invite the Bot`)
      .setColor(COLORS.info)
      .setDescription('Add the bot to your server!')
      .addFields([
        { name: 'Invite Link', value: '[Invite Here](https://discord.com/oauth2/authorize)', inline: false },
        { name: 'Permissions', value: 'The bot requires basic permissions to function properly.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default InviteCommand;

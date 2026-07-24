import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InviteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'invite',
      description: 'Get the bot\'s invite link',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/invite', 'p!invite'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📨 Invite Panindigan`)
      .setColor(COLORS.info)
      .setDescription('Add Panindigan to your server!')
      .addFields([
        { name: 'Invite Link', value: '[Invite here](https://discord.com/oauth2/authorize)', inline: true },
      ])
      .setFooter({ text: 'Thank you for choosing Panindigan!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📨 Invite Panindigan`)
      .setColor(COLORS.info)
      .setDescription('Add Panindigan to your server!')
      .addFields([
        { name: 'Invite Link', value: '[Invite here](https://discord.com/oauth2/authorize)', inline: true },
      ])
      .setFooter({ text: 'Thank you for choosing Panindigan!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default InviteCommand;

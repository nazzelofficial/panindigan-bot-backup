import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AfkCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'afk',
      description: 'Set yourself as AFK (Away From Keyboard)',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/afk', '/afk eating lunch', 'p!afk working'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason = interaction.options.getString('reason') || 'AFK';
    const userId = interaction.user.id;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏸️ AFK Set`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} is now AFK: **${reason}**`)
      .addFields([
        { name: 'Reason', value: reason, inline: true },
        { name: 'Since', value: new Date().toLocaleString(), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const reason = args.join(' ') || 'AFK';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏸️ AFK Set`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} is now AFK: **${reason}**`)
      .addFields([
        { name: 'Reason', value: reason, inline: true },
        { name: 'Since', value: new Date().toLocaleString(), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AfkCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AfkCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'afk',
      description: 'Set AFK status',
      category: 'fun',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['away'],
      examples: ['/afk', '/afk eating', 'p!afk sleeping'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const reason = interaction.options.getString('reason') || 'AFK';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ⏰ AFK`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} is now AFK: ${reason}`)
      .addFields([
        { name: 'Status', value: 'Away From Keyboard', inline: true },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const reason = args.join(' ') || 'AFK';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ⏰ AFK`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} is now AFK: ${reason}`)
      .addFields([
        { name: 'Status', value: 'Away From Keyboard', inline: true },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AfkCommand;

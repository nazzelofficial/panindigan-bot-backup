// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TableFlipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'tableflip',
      description: 'Flip a table',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['flip', 'rage'],
      examples: ['/tableflip', 'p!tableflip'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} (╯°□°）╯︵ ┻━┻ Table Flip`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} flips a table (╯°□°）╯︵ ┻━┻`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} (╯°□°）╯︵ ┻━┻ Table Flip`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} flips a table (╯°□°）╯︵ ┻━┻`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TableFlipCommand;

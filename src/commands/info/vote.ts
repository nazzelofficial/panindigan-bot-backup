import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class VoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'vote',
      description: 'Get information about voting for the bot',
      category: 'info',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/vote', 'p!vote'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Vote for the Bot`)
      .setColor(COLORS.info)
      .setDescription('Support the bot by voting on bot lists!')
      .addFields([
        { name: 'Top.gg', value: '[Vote Here](https://top.gg)', inline: true },
        { name: 'Discord Bot List', value: '[Vote Here](https://discordbotlist.com)', inline: true },
        { name: 'Rewards', value: 'This is a placeholder. Voting rewards will be implemented with database integration.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Vote for the Bot`)
      .setColor(COLORS.info)
      .setDescription('Support the bot by voting on bot lists!')
      .addFields([
        { name: 'Top.gg', value: '[Vote Here](https://top.gg)', inline: true },
        { name: 'Discord Bot List', value: '[Vote Here](https://discordbotlist.com)', inline: true },
        { name: 'Rewards', value: 'This is a placeholder. Voting rewards will be implemented with database integration.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default VoteCommand;

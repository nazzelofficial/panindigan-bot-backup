import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class VoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'vote',
      description: 'Vote for Panindigan on bot listing sites',
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

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🗳️ Vote for Panindigan`)
      .setColor(0xf59e0b)
      .setDescription('Help Panindigan grow by voting on bot listing sites! Your vote helps more servers discover the bot. 🙏')
      .addFields(
        { name: '🔝 Top.gg', value: '[Vote here](https://top.gg/bot/panindigan/vote)', inline: true },
        { name: '🤖 Discord Bot List', value: '[Vote here](https://discordbotlist.com)', inline: true },
        { name: '🎁 Vote Rewards', value: 'Voting gives you **bonus XP** and **in-game currency**!\nVote every 12 hours for maximum rewards.', inline: false },
      )
      .setFooter({ text: 'Salamat sa iyong suporta! 🇵🇭' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🗳️ Vote for Panindigan`)
      .setColor(0xf59e0b)
      .setDescription('Vote on bot listing sites to help Panindigan grow! 🙏')
      .addFields(
        { name: '🔝 Top.gg', value: '[Vote here](https://top.gg/bot/panindigan/vote)', inline: true },
        { name: '🎁 Rewards', value: 'Bonus XP + in-game currency every vote!', inline: false },
      )
      .setFooter({ text: 'Salamat sa suporta! 🇵🇭' })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default VoteCommand;

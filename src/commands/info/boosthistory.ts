import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class BoostHistoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'boosthistory',
      description: 'Display server boost history',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boosts'],
      examples: ['/boosthistory', 'p!boosthistory'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🚀 Boost History`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Boost history will be implemented with database integration.')
      .addFields([
        { name: 'Current Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(guild.premiumSubscriptionCount), inline: true },
        { name: 'Recent Boosts', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🚀 Boost History`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Boost history will be implemented with database integration.')
      .addFields([
        { name: 'Current Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(guild.premiumSubscriptionCount), inline: true },
        { name: 'Recent Boosts', value: 'N/A', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BoostHistoryCommand;

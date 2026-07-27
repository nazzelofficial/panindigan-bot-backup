// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';

export class BoostInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'boostinfo',
      description: 'Display server boost information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boost', 'serverboost'],
      examples: ['/boostinfo', 'p!boostinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const premiumTier = guild.premiumTier;
    const premiumSubscriptionCount = guild.premiumSubscriptionCount;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Boost Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Boost Level', value: `Level ${premiumTier}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(premiumSubscriptionCount), inline: true },
        { name: 'Boosts Needed for Next Level', value: this.getBoostsNeeded(premiumTier), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const premiumTier = guild.premiumTier;
    const premiumSubscriptionCount = guild.premiumSubscriptionCount;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Server Boost Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Boost Level', value: `Level ${premiumTier}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(premiumSubscriptionCount), inline: true },
        { name: 'Boosts Needed for Next Level', value: this.getBoostsNeeded(premiumTier), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private getBoostsNeeded(tier: number): string {
    const boostsNeeded = {
      0: '2 (Level 1)',
      1: '7 (Level 2)',
      2: '14 (Level 3)',
      3: 'Max Level',
    };
    return boostsNeeded[tier as keyof typeof boostsNeeded] || 'Unknown';
  }
}

export default BoostInfoCommand;

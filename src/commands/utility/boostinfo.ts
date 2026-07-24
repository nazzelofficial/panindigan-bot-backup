import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class BoostInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'boostinfo',
      description: 'Display server boost information',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['boost'],
      examples: ['/boostinfo', 'p!boostinfo'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    
    const boosts = guild.premiumSubscriptionCount;
    const level = guild.premiumTier;
    const boosters = guild.members.cache.filter(m => m.premiumSince).size;
    
    const boostsNeeded = {
      0: 2,
      1: 7,
      2: 14,
    };
    
    const nextLevel = level < 2 ? level + 1 : 3;
    const needed = nextLevel <= 2 ? boostsNeeded[nextLevel as keyof typeof boostsNeeded] - boosts : 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🚀 Server Boost Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Current Level', value: `Level ${level}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(boosts), inline: true },
        { name: 'Boosters', value: Formatter.formatNumber(boosters), inline: true },
        { name: 'Boosts to Next Level', value: nextLevel <= 2 ? Formatter.formatNumber(needed) : 'Max Level', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    
    const boosts = guild.premiumSubscriptionCount;
    const level = guild.premiumTier;
    const boosters = guild.members.cache.filter(m => m.premiumSince).size;
    
    const boostsNeeded = {
      0: 2,
      1: 7,
      2: 14,
    };
    
    const nextLevel = level < 2 ? level + 1 : 3;
    const needed = nextLevel <= 2 ? boostsNeeded[nextLevel as keyof typeof boostsNeeded] - boosts : 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🚀 Server Boost Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Current Level', value: `Level ${level}`, inline: true },
        { name: 'Total Boosts', value: Formatter.formatNumber(boosts), inline: true },
        { name: 'Boosters', value: Formatter.formatNumber(boosters), inline: true },
        { name: 'Boosts to Next Level', value: nextLevel <= 2 ? Formatter.formatNumber(needed) : 'Max Level', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BoostInfoCommand;

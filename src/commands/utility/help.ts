import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HelpCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'help',
      description: 'Display help information',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/help', '/help moderation', 'p!help'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString('category');

    if (category) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Help: ${category.toUpperCase()}`)
        .setColor(COLORS.info)
        .setDescription(`Commands in the ${category} category will be listed here.`)
        .setFooter({ text: 'Use /help for all categories' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Panindigan Help`)
        .setColor(COLORS.info)
        .setDescription('Panindigan is an all-in-one Discord bot with 900 commands across 18 categories!')
        .addFields([
          { name: 'Categories', value: 'help, moderation, admin, music, economy, games, fun, ai, info, utility, social, leveling, giveaway, image, starboard, applications, premium, owner', inline: false },
          { name: 'Prefix', value: 'p!', inline: true },
          { name: 'Support', value: '[Join here](https://discord.gg/panindigan)', inline: true },
        ])
        .setFooter({ text: 'Use /help [category] for category-specific commands' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const category = args[0];

    if (category) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Help: ${category.toUpperCase()}`)
        .setColor(COLORS.info)
        .setDescription(`Commands in the ${category} category will be listed here.`)
        .setFooter({ text: 'Use p!help for all categories' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Panindigan Help`)
        .setColor(COLORS.info)
        .setDescription('Panindigan is an all-in-one Discord bot with 900 commands across 18 categories!')
        .addFields([
          { name: 'Categories', value: 'help, moderation, admin, music, economy, games, fun, ai, info, utility, social, leveling, giveaway, image, starboard, applications, premium, owner', inline: false },
          { name: 'Prefix', value: 'p!', inline: true },
          { name: 'Support', value: '[Join here](https://discord.gg/panindigan)', inline: true },
        ])
        .setFooter({ text: 'Use p!help [category] for category-specific commands' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  }
}

export default HelpCommand;

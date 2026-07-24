import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NitroCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'nitro',
      description: 'Display information about Discord Nitro',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/nitro', 'p!nitro'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💎 Discord Nitro Information`)
      .setColor(COLORS.info)
      .setDescription('Discord Nitro enhances your Discord experience with exclusive perks!')
      .addFields([
        { name: 'Nitro Classic', value: '$9.99/month - Custom emojis, animated avatars, larger uploads', inline: false },
        { name: 'Nitro', value: '$14.99/month - Everything in Classic + 2 server boosts, streaming quality', inline: false },
        { name: 'Nitro Basic', value: '$2.99/month - Custom emojis, animated avatars, smaller uploads', inline: false },
        { name: 'Server Boosting', value: 'Boost your server for better perks and perks for all members!', inline: false },
      ])
      .setFooter({ text: 'Get Nitro at discord.com/nitro' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💎 Discord Nitro Information`)
      .setColor(COLORS.info)
      .setDescription('Discord Nitro enhances your Discord experience with exclusive perks!')
      .addFields([
        { name: 'Nitro Classic', value: '$9.99/month - Custom emojis, animated avatars, larger uploads', inline: false },
        { name: 'Nitro', value: '$14.99/month - Everything in Classic + 2 server boosts, streaming quality', inline: false },
        { name: 'Nitro Basic', value: '$2.99/month - Custom emojis, animated avatars, smaller uploads', inline: false },
        { name: 'Server Boosting', value: 'Boost your server for better perks and perks for all members!', inline: false },
      ])
      .setFooter({ text: 'Get Nitro at discord.com/nitro' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default NitroCommand;

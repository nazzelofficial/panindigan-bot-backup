import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DonateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'donate',
      description: 'Support Panindigan development or upgrade to premium',
      category: 'info',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['support', 'patreon'],
      examples: ['/donate', 'p!donate'],
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
      .setTitle(`❤️ Support Panindigan`)
      .setColor(0xff6b6b)
      .setDescription('Your support keeps Panindigan running and improving! Every contribution matters. 🙏\n\n**Panindigan Premium** is a one-time payment — no subscriptions, no recurring charges.')
      .addFields(
        { name: '💎 Premium Tiers', value: [
          '🥉 **Bronze** — ₱49 one-time — Essential features',
          '⭐ **Silver** — ₱99 one-time — Enhanced AI & music',
          '💎 **Gold** — ₱199 one-time — Advanced tools',
          '👑 **Diamond** — ₱399 one-time — All features + VIP',
        ].join('\n'), inline: false },
        { name: '🎯 Free Trial', value: 'Try **Diamond** free for 7 days! Use `/premium trial`', inline: false },
        { name: '☕ Ko-fi', value: '[Support on Ko-fi](https://ko-fi.com)', inline: true },
        { name: '🎮 Patreon', value: '[Support on Patreon](https://patreon.com)', inline: true },
        { name: '💬 Support Server', value: '[Join here](https://discord.gg/panindigan)', inline: true },
      )
      .setFooter({ text: 'Salamat sa lahat ng sumusuporta! 🇵🇭' })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`❤️ Support Panindigan`)
      .setColor(0xff6b6b)
      .addFields(
        { name: '💎 Premium (One-Time)', value: '🥉 Bronze ₱49 | ⭐ Silver ₱99 | 💎 Gold ₱199 | 👑 Diamond ₱399', inline: false },
        { name: '🎯 Free Trial', value: '7 days Diamond free! Use `p!premium trial`', inline: false },
        { name: '☕ Ko-fi', value: '[Support on Ko-fi](https://ko-fi.com)', inline: true },
      )
      .setFooter({ text: 'Salamat sa suporta! 🇵🇭' })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default DonateCommand;

// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ShibaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shiba',
      description: 'Get a random Shiba Inu image',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shibainu', 'doge'],
      examples: ['/shiba', 'p!shiba'],
    };
    super(options);
  }

  private async fetchShibaImage(): Promise<string | null> {
    try {
      const response = await fetch('https://shibe.online/api/shibes?count=1');
      if (!response.ok) return null;
      const data = await response.json() as string[];
      return data[0] ?? null;
    } catch {
      return null;
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const imageUrl = await this.fetchShibaImage();

    if (!imageUrl) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a Shiba Inu image right now. Please try again later!')
        .setColor(COLORS.error);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🐕 Random Shiba Inu')
      .setColor(0xe07a3e)
      .setImage(imageUrl)
      .setFooter({ text: 'Powered by shibe.online • Such wow! 🐕' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const imageUrl = await this.fetchShibaImage();

    if (!imageUrl) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a Shiba Inu image right now. Please try again later!')
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🐕 Random Shiba Inu')
      .setColor(0xe07a3e)
      .setImage(imageUrl)
      .setFooter({ text: 'Powered by shibe.online • Such wow! 🐕' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ShibaCommand;

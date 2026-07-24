import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DuckCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'duck',
      description: 'Get a random duck image',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['quack', 'duckpic'],
      examples: ['/duck', 'p!duck'],
    };
    super(options);
  }

  private async fetchDuckImage(): Promise<string | null> {
    try {
      const response = await fetch('https://random-d.uk/api/v2/random');
      if (!response.ok) return null;
      const data = await response.json() as { url: string; message: string };
      return data.url ?? null;
    } catch {
      return null;
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const imageUrl = await this.fetchDuckImage();

    if (!imageUrl) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a duck image right now. Please try again later!')
        .setColor(COLORS.error);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🦆 Random Duck')
      .setColor(0xf5d800)
      .setImage(imageUrl)
      .setFooter({ text: 'Powered by random-d.uk • Quack! 🦆' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const imageUrl = await this.fetchDuckImage();

    if (!imageUrl) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a duck image right now. Please try again later!')
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🦆 Random Duck')
      .setColor(0xf5d800)
      .setImage(imageUrl)
      .setFooter({ text: 'Powered by random-d.uk • Quack! 🦆' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DuckCommand;

// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class DadjokeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dadjoke',
      description: 'Get a random dad joke',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dad', 'joke2'],
      examples: ['/dadjoke', 'p!dadjoke'],
    };
    super(options);
  }

  private async fetchJoke(): Promise<string | null> {
    try {
      const response = await fetch('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json() as { id: string; joke: string; status: number };
      return data.joke ?? null;
    } catch {
      return null;
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const joke = await this.fetchJoke();

    if (!joke) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a dad joke right now. Please try again later!')
        .setColor(COLORS.error);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('👨 Dad Joke')
      .setDescription(`*${joke}*`)
      .setColor(COLORS.warning)
      .setFooter({ text: 'Powered by icanhazdadjoke.com 😄' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const joke = await this.fetchJoke();

    if (!joke) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Fetch Failed`)
        .setDescription('Could not fetch a dad joke right now. Please try again later!')
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('👨 Dad Joke')
      .setDescription(`*${joke}*`)
      .setColor(COLORS.warning)
      .setFooter({ text: 'Powered by icanhazdadjoke.com 😄' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DadjokeCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DictionaryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dictionary',
      description: 'Look up the definition of a word',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['define', 'dict', 'def'],
      examples: ['/dictionary serendipity', 'p!define ephemeral'],
    };
    super(options);
  }

  private async fetchDefinition(word: string): Promise<any[] | null> {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  private buildEmbed(data: any[]): EmbedBuilder {
    const entry = data[0];
    const word = entry.word;
    const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || 'N/A';
    const meanings = entry.meanings?.slice(0, 3) || [];

    const embed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`📖 ${word}`)
      .setDescription(`*Phonetic:* ${phonetic}`)
      .setTimestamp();

    for (const meaning of meanings) {
      const def = meaning.definitions?.[0];
      if (!def) continue;
      let value = def.definition;
      if (def.example) value += `\n*Example:* "${def.example}"`;
      if (def.synonyms?.length) value += `\n*Synonyms:* ${def.synonyms.slice(0, 3).join(', ')}`;
      embed.addFields({ name: `📌 ${meaning.partOfSpeech}`, value: value.slice(0, 1024) });
    }

    if (entry.sourceUrls?.[0]) {
      embed.setFooter({ text: `Source: ${entry.sourceUrls[0]}` });
    }

    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const word = interaction.options.getString('word', true);
    await interaction.deferReply();

    const data = await this.fetchDefinition(word);
    if (!data) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not Found`)
        .setDescription(`No definition found for **${word}**.`);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    await interaction.editReply({ embeds: [this.buildEmbed(data)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!dictionary <word>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const word = args[0];
    const msg = await message.reply({ content: `${EMOJIS.loading} Looking up **${word}**...` });

    const data = await this.fetchDefinition(word);
    if (!data) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Not Found`)
        .setDescription(`No definition found for **${word}**.`);
      await msg.edit({ content: '', embeds: [embed] });
      return;
    }

    await msg.edit({ content: '', embeds: [this.buildEmbed(data)] });
  }
}

export default DictionaryCommand;

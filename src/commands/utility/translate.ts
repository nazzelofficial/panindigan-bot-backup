import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TranslateUtilityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'translate',
      description: 'Translate text',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['trans', 'tl'],
      examples: ['p!translate Hello | Filipino'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Use `/translate` from the info category.', ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const input = args.join(' ');
    const parts = input.split('|');
    const text = parts[0]?.trim();
    const lang = parts[1]?.trim() || 'English';
    if (!text) return void message.reply(`${EMOJIS.error} Usage: \`p!translate <text> | <language>\``);
    const thinking = await message.reply(`${EMOJIS.info} Translating...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(text, `Translate to ${lang}. Provide only the translation.`);
      const embed = new EmbedBuilder()
        .setTitle(`🌐 Translation → ${lang}`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: `🌍 ${lang}`, value: response.content.slice(0, 2000), inline: false }
        ).setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Translation failed: ${err.message}`);
    }
  }
}

export default TranslateUtilityCommand;

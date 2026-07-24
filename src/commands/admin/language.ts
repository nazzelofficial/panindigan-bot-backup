import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class LanguageCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'language',
      description: 'Change the bot language for this server',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lang', 'setlanguage'],
      examples: ['/language en', 'p!language fil'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const language = interaction.options.getString('language');

    if (!language) {
      await interaction.reply({ content: '❌ Please provide a language (en or fil).', ephemeral: true });
      return;
    }

    if (!['en', 'fil'].includes(language)) {
      await interaction.reply({ content: '❌ Language must be either "en" (English) or "fil" (Filipino).', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { language },
    });

    const languageName = language === 'en' ? 'English' : 'Filipino';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Language Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Language', value: languageName, inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const language = args[0];

    if (!language) {
      await message.reply('❌ Please provide a language (en or fil).');
      return;
    }

    if (!['en', 'fil'].includes(language)) {
      await message.reply('❌ Language must be either "en" (English) or "fil" (Filipino).');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { language },
    });

    const languageName = language === 'en' ? 'English' : 'Filipino';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Language Updated`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Language', value: languageName, inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LanguageCommand;

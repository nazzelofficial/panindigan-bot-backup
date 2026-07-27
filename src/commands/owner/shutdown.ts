// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ShutdownCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'shutdown',
      description: 'Shutdown the bot process (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['die', 'stop'],
      examples: ['/shutdown', 'p!shutdown'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('🔴 Shutting Down')
      .setDescription('The bot is shutting down in 2 seconds...')
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
    setTimeout(() => process.exit(0), 2000);
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle('🔴 Shutting Down')
      .setDescription('The bot is shutting down in 2 seconds...')
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
    setTimeout(() => process.exit(0), 2000);
  }
}

export default ShutdownCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SetNameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setname',
      description: 'Change the bot\'s username (Owner only)',
      category: 'admin',
      cooldown: 60,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['botname', 'changename'],
      examples: ['/setname NewBotName', 'p!setname NewBotName'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a new username.', ephemeral: true });
      return;
    }

    if (name.length < 2 || name.length > 32) {
      await interaction.reply({ content: '❌ Username must be between 2 and 32 characters.', ephemeral: true });
      return;
    }

    try {
      await interaction.client.user.setUsername(name);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Username Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Name', value: name, inline: true },
          { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to update username. This can only be done once every 2 hours.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args.join(' ');

    if (!name) {
      await message.reply('❌ Please provide a new username.');
      return;
    }

    if (name.length < 2 || name.length > 32) {
      await message.reply('❌ Username must be between 2 and 32 characters.');
      return;
    }

    try {
      await message.client.user.setUsername(name);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Username Updated`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'New Name', value: name, inline: true },
          { name: 'Updated by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to update username. This can only be done once every 2 hours.');
    }
  }
}

export default SetNameCommand;

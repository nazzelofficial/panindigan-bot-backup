// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class UnloadCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unload',
      description: 'Unload a command by name (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unloadcmd'],
      examples: ['/unload ping', 'p!unload ping'],
    };
    super(options);
  }

  private unloadCommand(commandName: string, client: any): { success: boolean; error?: string } {
    try {
      // Try to find and remove from client.commands collection if it exists
      if (client.commands && client.commands.has(commandName)) {
        client.commands.delete(commandName);
        return { success: true };
      }
      // Also try to clear from require cache by searching
      const cacheKeys = Object.keys(require.cache);
      const matchKey = cacheKeys.find(k => k.includes(`commands`) && k.includes(commandName));
      if (matchKey) {
        delete require.cache[matchKey];
        return { success: true };
      }
      return { success: false, error: `Command \`${commandName}\` not found in cache or registry.` };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    await interaction.deferReply({ ephemeral: true });

    const { success, error } = this.unloadCommand(commandName, interaction.client);

    const embed = new EmbedBuilder()
      .setColor(success ? COLORS.success : COLORS.error)
      .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Command Unload`)
      .setDescription(
        success
          ? `Successfully unloaded command: \`${commandName}\``
          : `Failed to unload command: \`${commandName}\`\n${error}`
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const commandName = args[0]?.toLowerCase();
    if (!commandName) {
      await message.reply(`${EMOJIS.error} Please provide a command name to unload.`);
      return;
    }

    const { success, error } = this.unloadCommand(commandName, message.client);

    const embed = new EmbedBuilder()
      .setColor(success ? COLORS.success : COLORS.error)
      .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Command Unload`)
      .setDescription(
        success
          ? `Successfully unloaded command: \`${commandName}\``
          : `Failed to unload command: \`${commandName}\`\n${error}`
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UnloadCommand;

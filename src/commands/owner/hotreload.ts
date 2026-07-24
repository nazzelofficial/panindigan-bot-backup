import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import * as fs from 'fs';
import * as path from 'path';

export class HotreloadCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'hotreload',
      description: 'Hot-reload all command files (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hr', 'hreload'],
      examples: ['/hotreload', 'p!hotreload'],
    };
    super(options);
  }

  private reloadAllCommands(): { count: number; errors: string[] } {
    const commandsDir = path.resolve(process.cwd(), 'src', 'commands');
    const errors: string[] = [];
    let count = 0;

    const walkDir = (dir: string): void => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          try {
            const resolved = require.resolve(fullPath);
            if (require.cache[resolved]) {
              delete require.cache[resolved];
              count++;
            }
          } catch (err: any) {
            errors.push(`${entry.name}: ${err?.message}`);
          }
        }
      }
    };

    walkDir(commandsDir);
    return { count, errors };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const loadingEmbed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${EMOJIS.loading} Hot-Reloading Commands...`)
      .setDescription('Please wait while all commands are being reloaded.')
      .setTimestamp();

    await interaction.editReply({ embeds: [loadingEmbed] });

    const { count, errors } = this.reloadAllCommands();

    const embed = new EmbedBuilder()
      .setColor(errors.length === 0 ? COLORS.success : COLORS.warning)
      .setTitle(`🔄 Hot-Reload Complete`)
      .addFields(
        { name: `${EMOJIS.success} Commands Cleared`, value: `\`${count}\` command modules removed from cache`, inline: true },
        { name: `${EMOJIS.error} Errors`, value: `\`${errors.length}\``, inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag} • Restart bot to re-register commands` })
      .setTimestamp();

    if (errors.length > 0) {
      embed.addFields({ name: 'Error Details', value: errors.slice(0, 5).join('\n').slice(0, 1024), inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const loadingEmbed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle(`${EMOJIS.loading} Hot-Reloading Commands...`)
      .setDescription('Please wait while all commands are being reloaded.')
      .setTimestamp();

    const reply = await message.reply({ embeds: [loadingEmbed] });
    const { count, errors } = this.reloadAllCommands();

    const embed = new EmbedBuilder()
      .setColor(errors.length === 0 ? COLORS.success : COLORS.warning)
      .setTitle(`🔄 Hot-Reload Complete`)
      .addFields(
        { name: `${EMOJIS.success} Commands Cleared`, value: `\`${count}\` command modules removed from cache`, inline: true },
        { name: `${EMOJIS.error} Errors`, value: `\`${errors.length}\``, inline: true },
      )
      .setFooter({ text: `Requested by ${message.author.tag} • Restart bot to re-register commands` })
      .setTimestamp();

    if (errors.length > 0) {
      embed.addFields({ name: 'Error Details', value: errors.slice(0, 5).join('\n').slice(0, 1024), inline: false });
    }

    await reply.edit({ embeds: [embed] });
  }
}

export default HotreloadCommand;

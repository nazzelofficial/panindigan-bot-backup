// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, version as djsVersion } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
import { PALETTE, KIT, divider } from '../../utils/EmbedSystem.js';
import process from 'node:process';

export class BotInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'botinfo',
      description: 'Display detailed information about the bot',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bi', 'about'],
      examples: ['/botinfo', 'p!botinfo'],
    };
    super(options);
  }

  private buildEmbed(client: any): EmbedBuilder {
    const uptime = Formatter.formatUptime(client.uptime ?? 0);
    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const ping = Math.round(client.ws.ping);
    const guilds = Formatter.formatNumber(client.guilds.cache.size);
    const users = Formatter.formatNumber(client.users.cache.size);
    const cmds = Formatter.formatNumber(client.commands?.size ?? 0);
    const nodeVer = process.version;

    return new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL({ size: 256 }),
      })
      .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
      .setDescription(
        `> **All-in-one Discord bot for Filipino communities.**\n` +
        `> Built with TypeScript, Discord.js v${djsVersion}, and modern tooling.\n` +
        `\u200b`
      )
      .addFields(
        { name: `${KIT.server} Overview`, value: divider(), inline: false },
        { name: '🏠 Servers',   value: guilds,           inline: true },
        { name: '👥 Users',     value: users,            inline: true },
        { name: '⚡ Commands',  value: cmds,             inline: true },
        { name: `${KIT.ping} Performance`, value: divider(), inline: false },
        { name: '📶 Ping',      value: `\`${ping}ms\``,  inline: true },
        { name: '💾 Memory',    value: `\`${memMB} MB\``,inline: true },
        { name: '⏱️ Uptime',    value: `\`${uptime}\``,  inline: true },
        { name: `${KIT.bot} Technical`, value: divider(), inline: false },
        { name: '🆔 Client ID', value: `\`${client.user.id}\``,        inline: true },
        { name: '📦 Node.js',   value: `\`${nodeVer}\``,               inline: true },
        { name: '📚 Discord.js',value: `\`v${djsVersion}\``,           inline: true },
      )
      .setFooter({ text: `Panindigan Bot  •  ${client.user.username}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ embeds: [this.buildEmbed(interaction.client)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await message.reply({ embeds: [this.buildEmbed(message.client)] });
  }
}

export default BotInfoCommand;

// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, version as djsVersion } from 'discord.js';
import { Formatter } from '../../utils/Formatter.js';
import { PALETTE, KIT, divider } from '../../utils/EmbedSystem.js';
import process from 'node:process';
import os from 'node:os';

export class StatsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'stats',
      description: 'Display bot statistics and performance metrics',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['statistics', 'botstats'],
      examples: ['/stats', 'p!stats'],
    };
    super(options);
  }

  private buildEmbed(client: any): EmbedBuilder {
    const mem = process.memoryUsage();
    const heapMB  = (mem.heapUsed  / 1024 / 1024).toFixed(1);
    const totalMB = (mem.heapTotal / 1024 / 1024).toFixed(1);
    const rssMB   = (mem.rss       / 1024 / 1024).toFixed(1);

    const cpuLoad = os.loadavg()[0].toFixed(2);
    const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
    const freeRAM  = (os.freemem()  / 1024 / 1024 / 1024).toFixed(1);

    const uptime = Formatter.formatUptime(client.uptime ?? 0);
    const ping   = Math.round(client.ws.ping);
    const guilds  = Formatter.formatNumber(client.guilds.cache.size);
    const users   = Formatter.formatNumber(client.users.cache.size);
    const channels= Formatter.formatNumber(client.channels.cache.size);
    const emojis  = Formatter.formatNumber(client.emojis.cache.size);
    const cmds    = Formatter.formatNumber(client.commands?.size ?? 0);

    return new EmbedBuilder()
      .setColor(PALETTE.primary)
      .setAuthor({
        name: `${client.user.username} — Statistics`,
        iconURL: client.user.displayAvatarURL({ size: 64 }),
      })
      .addFields(
        { name: `${KIT.chart} Bot Stats`, value: divider(), inline: false },
        { name: '🏠 Servers',   value: guilds,    inline: true },
        { name: '👥 Users',     value: users,     inline: true },
        { name: '💬 Channels',  value: channels,  inline: true },
        { name: '😀 Emojis',    value: emojis,    inline: true },
        { name: '⚡ Commands',  value: cmds,      inline: true },
        { name: '⏱️ Uptime',    value: uptime,    inline: true },
        { name: `${KIT.ping} Performance`, value: divider(), inline: false },
        { name: '📶 WS Ping',   value: `\`${ping}ms\``,                  inline: true },
        { name: '💾 Heap',      value: `\`${heapMB}/${totalMB} MB\``,    inline: true },
        { name: '📊 RSS',       value: `\`${rssMB} MB\``,                inline: true },
        { name: `🖥️ System`, value: divider(), inline: false },
        { name: '⚙️ CPU Load',  value: `\`${cpuLoad}\``,                 inline: true },
        { name: '🧠 RAM',       value: `\`${freeRAM}/${totalRAM} GB\``,  inline: true },
        { name: '📦 Node.js',   value: `\`${process.version}\``,         inline: true },
      )
      .setFooter({ text: `Discord.js v${djsVersion}  •  Panindigan Bot` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ embeds: [this.buildEmbed(interaction.client)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await message.reply({ embeds: [this.buildEmbed(message.client)] });
  }
}

export default StatsCommand;

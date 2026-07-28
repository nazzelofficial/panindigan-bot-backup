// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';

export class UptimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uptime',
      description: 'Display how long the bot has been online',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['up'],
      examples: ['/uptime', 'p!uptime'],
    };
    super(options);
  }

  private buildEmbed(client: any): EmbedBuilder {
    const ms      = client.uptime ?? 0;
    const uptime  = Formatter.formatUptime(ms);
    const since   = new Date(Date.now() - ms);
    const sinceTs = `<t:${Math.floor(since.getTime() / 1000)}:R>`;

    return new EmbedBuilder()
      .setColor(PALETTE.success)
      .setAuthor({
        name: `${client.user.username} — Uptime`,
        iconURL: client.user.displayAvatarURL({ size: 64 }),
      })
      .setDescription(`⏱️ **${uptime}**\n\nOnline since ${sinceTs}`)
      .setFooter({ text: 'Panindigan Bot  •  Staying online 24/7' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ embeds: [this.buildEmbed(interaction.client)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await message.reply({ embeds: [this.buildEmbed(message.client)] });
  }
}

export default UptimeCommand;

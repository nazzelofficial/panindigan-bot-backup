// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT } from '../../utils/EmbedSystem.js';

function latencyBar(ms: number): string {
  if (ms < 80)  return '🟢';
  if (ms < 150) return '🟡';
  if (ms < 300) return '🟠';
  return '🔴';
}

export class PingCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ping',
      description: 'Check the bot latency and connection quality',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['latency', 'pong'],
      examples: ['/ping', 'p!ping'],
    };
    super(options);
  }

  private buildEmbed(api: number, ws: number, client: any): EmbedBuilder {
    const apiIcon = latencyBar(api);
    const wsIcon  = latencyBar(ws);
    const overall = Math.round((api + ws) / 2);
    const qualityLabel = overall < 80 ? 'Excellent' : overall < 150 ? 'Good' : overall < 300 ? 'Fair' : 'Poor';

    return new EmbedBuilder()
      .setColor(overall < 150 ? PALETTE.success : overall < 300 ? PALETTE.warning : PALETTE.error)
      .setAuthor({
        name: '🏓 Pong!',
        iconURL: client.user.displayAvatarURL({ size: 64 }),
      })
      .setDescription(`Connection quality: **${qualityLabel}**`)
      .addFields(
        { name: `${apiIcon} API Latency`,       value: `\`${api}ms\``,      inline: true },
        { name: `${wsIcon} WebSocket`,           value: `\`${ws}ms\``,       inline: true },
        { name: `📡 Overall`,                    value: `\`${overall}ms\``,  inline: true },
      )
      .setFooter({ text: 'Panindigan Bot  •  Real-time latency' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const initial = await interaction.reply({ content: `${KIT.loading} Measuring latency...`, fetchReply: true });
    const api = initial.createdTimestamp - interaction.createdTimestamp;
    const ws  = Math.round(interaction.client.ws.ping);
    await interaction.editReply({ content: null, embeds: [this.buildEmbed(api, ws, interaction.client)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const sent = await message.reply({ content: `${KIT.loading} Measuring latency...` });
    const api  = sent.createdTimestamp - message.createdTimestamp;
    const ws   = Math.round(message.client.ws.ping);
    await sent.edit({ content: null, embeds: [this.buildEmbed(api, ws, message.client)] });
  }
}

export default PingCommand;

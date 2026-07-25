import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import fs from 'fs';
import path from 'path';

export class ErrorlogsCommand extends BaseCommand {
  constructor() {
    super({ name: 'errorlogs', description: 'Read error log (last 30 lines)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['errlogs', 'elogs'], examples: ['p!errorlogs'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const logPath = path.resolve('logs/error.log');
    if (!fs.existsSync(logPath)) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Error log not found at `logs/error.log`.'));
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim()).slice(-30).join('\n').slice(-1800);
    const embed = new EmbedBuilder().setColor(COLORS.error).setTitle('🚨 Error Logs (Last 30)')
      .setDescription(`\`\`\`\n${lines || 'No errors found. 🎉'}\n\`\`\``);
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default ErrorlogsCommand;

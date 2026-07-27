// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';

export class GuildsettingsCommand extends BaseCommand {
  constructor() {
    super({ name: 'guildsettings', description: 'Show all settings for a guild', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['gsettings'], examples: ['p!guildsettings 123456789'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, guildId: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!guildId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
    try {
      const prisma = getPrismaClient();
      const guild = await (prisma as any).guild?.findUnique({ where: { id: guildId } }).catch(() => null);
      if (!guild) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Guild not found in database.'));
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`⚙️ Guild Settings: ${guildId}`)
        .setDescription(`\`\`\`json\n${JSON.stringify(guild, null, 2).slice(0, 1800)}\n\`\`\``);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('guild_id', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default GuildsettingsCommand;

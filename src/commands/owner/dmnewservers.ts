import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class DmnewserversCommand extends BaseCommand {
  constructor() {
    super({ name: 'dmnewservers', description: 'Show info about DMing owners of newest guilds', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['dmns'], examples: ['p!dmnewservers'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const guilds = [...client.guilds.cache.values()].sort((a, b) => (b.joinedAt?.getTime() ?? 0) - (a.joinedAt?.getTime() ?? 0)).slice(0, 10);
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📬 DM New Servers Feature')
      .setDescription(`This feature allows you to DM the owner of the newest guilds.\n\n**Total Guilds:** ${client.guilds.cache.size}\n\n**10 Newest Guilds:**\n${guilds.map(g => `• \`${g.id}\` — ${g.name}`).join('\n')}\n\nTo DM a guild owner, use \`guildsend <guild_id> <message>\`.`);
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default DmnewserversCommand;

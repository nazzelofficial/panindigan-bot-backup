// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class PypiCommand extends BaseCommand {
  constructor() {
    super({ name: 'pypi', description: 'Look up a Python package on PyPI', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pip', 'pypkg'], examples: ['/pypi requests', 'p!pypi numpy'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, pkg: string): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    if (!pkg) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a package name.'));
    try {
      const resp = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg)}/json`, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Package \`${pkg}\` not found on PyPI.`));
      const data = await resp.json() as any;
      const info = data.info;
      const embed = new EmbedBuilder().setColor(0x3776AB).setTitle(`🐍 PyPI: ${info.name}`)
        .setURL(info.project_url ?? `https://pypi.org/project/${info.name}`)
        .setDescription((info.summary ?? 'No description.').slice(0, 300))
        .addFields(
          { name: '📌 Version', value: info.version ?? 'N/A', inline: true },
          { name: '📜 License', value: info.license ?? 'N/A', inline: true },
          { name: '👤 Author', value: info.author ?? 'N/A', inline: true },
          { name: '🐍 Python', value: info.requires_python ?? 'N/A', inline: true },
          { name: '📦 Install', value: `\`pip install ${info.name}\``, inline: false },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('package', true)); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default PypiCommand;

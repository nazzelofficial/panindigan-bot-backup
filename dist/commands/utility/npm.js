// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class NpmCommand extends BaseCommand {
    constructor() {
        super({ name: 'npm', description: 'Look up an NPM package', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['npmpkg', 'package'], examples: ['/npm discord.js', 'p!npm express'] });
    }
    async run(i, m, pkg) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e] });
        else
            await m.reply({ embeds: [e] }); };
        if (!pkg)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a package name.'));
        try {
            const resp = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, { signal: AbortSignal.timeout(8000) });
            if (!resp.ok)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Package \`${pkg}\` not found on npm.`));
            const data = await resp.json();
            const latest = data['dist-tags']?.latest;
            const ver = latest ? data.versions?.[latest] : null;
            const embed = new EmbedBuilder().setColor(0xCC3534).setTitle(`📦 npm: ${data.name}`)
                .setURL(`https://www.npmjs.com/package/${data.name}`)
                .setDescription((data.description ?? 'No description.').slice(0, 300))
                .addFields({ name: '📌 Latest', value: latest ?? 'N/A', inline: true }, { name: '📅 Modified', value: data.time?.modified ? new Date(data.time.modified).toDateString() : 'N/A', inline: true }, { name: '📜 License', value: ver?.license ?? data.license ?? 'N/A', inline: true }, { name: '🔗 Repo', value: ver?.repository?.url?.replace('git+', '').replace('.git', '') ?? 'N/A', inline: false });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('package', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default NpmCommand;

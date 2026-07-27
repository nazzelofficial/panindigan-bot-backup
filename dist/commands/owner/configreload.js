// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import fs from 'fs';
export class ConfigreloadCommand extends BaseCommand {
    constructor() {
        super({ name: 'configreload', description: 'Reload and re-validate config.json', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cfreload'], examples: ['p!configreload'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        try {
            if (!fs.existsSync('config.json'))
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ config.json not found.'));
            const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
            const keys = Object.keys(config);
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Config Reloaded')
                .setDescription(`config.json reloaded successfully.\n**Keys found:** ${keys.length}\n**Keys:** ${keys.join(', ')}`));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Config parse error: ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default ConfigreloadCommand;

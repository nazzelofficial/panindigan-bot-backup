// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import fs from 'fs';
export class ConfiggetCommand extends BaseCommand {
    constructor() {
        super({ name: 'configget', description: 'Get a value from config.json', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cfget'], examples: ['p!configget PREFIX'] });
    }
    async run(i, m, key) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!key)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a config key.'));
        try {
            const configPath = 'config.json';
            if (!fs.existsSync(configPath))
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ config.json not found.'));
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const value = config[key];
            if (value === undefined)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Key \`${key}\` not found in config.`));
            await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`⚙️ Config: ${key}`)
                .setDescription(`\`\`\`json\n${JSON.stringify(value, null, 2).slice(0, 1800)}\n\`\`\``));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('key', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default ConfiggetCommand;

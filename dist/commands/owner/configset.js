// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import fs from 'fs';
export class ConfigsetCommand extends BaseCommand {
    constructor() {
        super({ name: 'configset', description: 'Update a value in config.json', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cfset'], examples: ['p!configset PREFIX p!'] });
    }
    async run(i, m, key, value) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!key || !value)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `configset <key> <value>`'));
        try {
            const configPath = 'config.json';
            const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
            let parsed = value;
            try {
                parsed = JSON.parse(value);
            }
            catch { /* keep as string */ }
            config[key] = parsed;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Config Updated')
                .addFields({ name: 'Key', value: `\`${key}\``, inline: true }, { name: 'New Value', value: `\`${String(parsed).slice(0, 200)}\``, inline: true }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('key', true), i.options.getString('value', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], args.slice(1).join(' ')); }
}
export default ConfigsetCommand;

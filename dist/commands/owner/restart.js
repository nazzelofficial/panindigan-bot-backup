// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
export class RestartCommand extends BaseCommand {
    constructor() {
        super({ name: 'restart', description: 'Restart the bot process (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['reboot', 'reset'], examples: ['p!restart'] });
    }
    async executeSlash(i) {
        await i.reply({ content: '🔄 Restarting bot...', ephemeral: true });
        setTimeout(() => process.exit(0), 1000);
    }
    async executePrefix(m) {
        await m.reply('🔄 Restarting bot...');
        setTimeout(() => process.exit(0), 1000);
    }
}
export default RestartCommand;

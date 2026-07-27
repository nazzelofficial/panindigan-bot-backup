// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder } from 'discord.js';
import { PremiumHandler } from '../../handlers/PremiumHandler.js';
export class PremiumRevokeCommand extends BaseCommand {
    constructor() {
        super({ name: 'premium-revoke', description: 'Revoke a user\'s premium (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['revokepremium', 'removepremium'], examples: ['p!premium-revoke @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to revoke').setRequired(true)));
    }
    async executeSlash(i) {
        const target = i.options.getUser('user', true);
        const handler = new PremiumHandler();
        await handler.revokePremium(target.id);
        await i.reply({ content: `✅ Revoked premium from **${target.tag}**.`, ephemeral: true });
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first();
        if (!target) {
            await m.reply('❌ Mention a user.');
            return;
        }
        const handler = new PremiumHandler();
        await handler.revokePremium(target.id);
        await m.reply(`✅ Revoked premium from **${target.tag}**.`);
    }
}
export default PremiumRevokeCommand;

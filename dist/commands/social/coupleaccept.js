// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';
export class CoupleAcceptCommand extends BaseCommand {
    constructor() {
        super({ name: 'coupleaccept', description: 'Accept a pending couple request 💕', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['acceptcouple', 'acceptrequest'], examples: ['/coupleaccept', 'p!coupleaccept'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false));
    }
    async handle(userId, guildId, send) {
        const pendingRequest = await coupleConsentService.getPendingRequest(userId, guildId);
        if (!pendingRequest) {
            await send({ content: '❌ Wala kang pending na couple request sa kasalukuyan.', ephemeral: true });
            return;
        }
        const result = await coupleConsentService.acceptRequest(userId, guildId);
        if (!result.success) {
            await send({ content: `❌ ${result.error}`, ephemeral: true });
            return;
        }
        await coupleHistoryService.recordMarriage(pendingRequest.requesterId, userId, guildId);
        const embed = new EmbedBuilder()
            .setTitle('💑 Couple Status Accepted!')
            .setDescription(`💕 You and <@${pendingRequest.requesterId}> are now officially a couple!\n\n*Mahabang pagmamahal!* 🎊`)
            .setColor(0xff69b4)
            .setTimestamp();
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        await this.handle(i.user.id, i.guildId, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        await this.handle(m.author.id, m.guildId, (c) => m.reply(c));
    }
}
export default CoupleAcceptCommand;

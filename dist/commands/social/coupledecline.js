// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
export class CoupleDeclineCommand extends BaseCommand {
    constructor() {
        super({ name: 'coupledecline', description: 'Decline a pending couple request 💔', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['declinecouple', 'rejectrequest'], examples: ['/coupledecline', 'p!coupledecline'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false));
    }
    async handle(userId, guildId, send) {
        const pendingRequest = await coupleConsentService.getPendingRequest(userId, guildId);
        if (!pendingRequest) {
            await send({ content: '❌ Wala kang pending na couple request na tatanggihan.', ephemeral: true });
            return;
        }
        await coupleConsentService.declineRequest(userId, guildId);
        const embed = new EmbedBuilder()
            .setTitle('💔 Request Declined')
            .setDescription(`You have declined the couple request from <@${pendingRequest.requesterId}>.`)
            .setColor(COLORS.error)
            .setTimestamp();
        await send({ embeds: [embed], ephemeral: true });
    }
    async executeSlash(i) {
        await this.handle(i.user.id, i.guildId, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        await this.handle(m.author.id, m.guildId, (c) => m.reply(c));
    }
}
export default CoupleDeclineCommand;

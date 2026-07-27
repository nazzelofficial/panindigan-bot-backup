// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
export class CoupleCancelCommand extends BaseCommand {
    constructor() {
        super({ name: 'couplecancel', description: 'Cancel a couple request you sent 🚫', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cancelcouple', 'cancelrequest'], examples: ['/couplecancel', 'p!couplecancel'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false));
    }
    async handle(userId, guildId, send) {
        const result = await coupleConsentService.cancelRequest(userId, guildId);
        if (!result.success) {
            await send({ content: `❌ ${result.error || 'Walang pending request na ika-cancel.'}`, ephemeral: true });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('🚫 Request Cancelled')
            .setDescription('Your couple request has been cancelled.')
            .setColor(COLORS.warning)
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
export default CoupleCancelCommand;

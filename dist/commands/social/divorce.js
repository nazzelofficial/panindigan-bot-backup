// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';
export class DivorceCommand extends BaseCommand {
    constructor() {
        super({ name: 'divorce', description: 'End your couple relationship 💔', category: 'social', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['breakup', 'coupleremove'], examples: ['/divorce', 'p!divorce'] });
    }
    async executeSlash(i) {
        const result = await coupleConsentService.divorce(i.user.id, i.guildId);
        if (!result.success) {
            await i.reply({ content: `❌ ${result.error}`, ephemeral: true });
            return;
        }
        await coupleHistoryService.recordDivorce(i.user.id, result.spouseId, i.guildId);
        const embed = new EmbedBuilder().setDescription(`💔 **${i.user.username}** and <@${result.spouseId}> have separated.\n\n*Stay strong. Things will get better.* 💙`).setColor(COLORS.error).setTimestamp();
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const result = await coupleConsentService.divorce(m.author.id, m.guildId);
        if (!result.success) {
            await m.reply(`❌ ${result.error}`);
            return;
        }
        await coupleHistoryService.recordDivorce(m.author.id, result.spouseId, m.guildId);
        const embed = new EmbedBuilder().setDescription(`💔 **${m.author.username}** and <@${result.spouseId}> have separated.`).setColor(COLORS.error).setTimestamp();
        await m.reply({ embeds: [embed] });
    }
}
export default DivorceCommand;

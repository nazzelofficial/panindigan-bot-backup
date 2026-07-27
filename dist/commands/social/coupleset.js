// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { coupleConsentService } from '../../features/couple/CoupleConsentService.js';
import { coupleHistoryService } from '../../features/couple/CoupleHistoryService.js';
export class CoupleSetCommand extends BaseCommand {
    constructor() {
        super({ name: 'coupleset', description: 'Set couple status with mutual consent (both must run this) 💑', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['setcouple', 'confirmcouple'], examples: ['/coupleset @user', 'p!coupleset @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Your partner').setRequired(true))
            .setDMPermission(false));
    }
    async handle(userId, partnerId, guildId, send) {
        if (userId === partnerId) {
            await send({ content: '❌ Hindi mo maaaring i-set ang iyong sarili bilang partner!', ephemeral: true });
            return;
        }
        // Check if partner also has a mutual request with this user
        const pending = await coupleConsentService.getPendingRequest(userId, guildId);
        if (pending && pending.requesterId === partnerId) {
            // Accept the existing request
            await coupleConsentService.acceptRequest(userId, guildId);
            await coupleHistoryService.recordMarriage(partnerId, userId, guildId);
            const embed = new EmbedBuilder()
                .setTitle('💑 Couple Status Set!')
                .setDescription(`💕 <@${userId}> and <@${partnerId}> are now officially a couple!\n\n*Mahabang pagmamahal!* 🎊`)
                .setColor(0xff69b4).setTimestamp();
            await send({ embeds: [embed] });
        }
        else {
            // Send a new request
            const result = await coupleConsentService.sendRequest(userId, partnerId, guildId);
            if (!result.success) {
                await send({ content: `❌ ${result.error}`, ephemeral: true });
                return;
            }
            await send({ content: `💕 Couple request sent to <@${partnerId}>! They need to run \`/coupleset @${userId}\` or \`/coupleaccept\` to confirm.`, ephemeral: false });
        }
    }
    async executeSlash(i) {
        const t = i.options.getUser('user', true);
        await this.handle(i.user.id, t.id, i.guildId, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        const t = m.mentions.users.first();
        if (!t) {
            await m.reply('❌ Mention mo ang iyong partner!');
            return;
        }
        await this.handle(m.author.id, t.id, m.guildId, (c) => m.reply(c));
    }
}
export default CoupleSetCommand;

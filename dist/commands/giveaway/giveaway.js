// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits, } from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { ButtonManager } from '../../structures/ButtonManager.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayCommand extends BaseCommand {
    constructor() {
        super({
            name: 'giveaway',
            description: 'Create and manage giveaways',
            category: 'giveaway',
            premiumTier: 'free',
            cooldown: 5,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            aliases: ['gw', 'give'],
            examples: ['/giveaway start', '/giveaway end <id>', '/giveaway reroll <id>'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('start').setDescription('Start a new giveaway')
            .addStringOption(o => o.setName('prize').setDescription('What is being given away').setRequired(true))
            .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 1h, 30m, 1d)').setRequired(true))
            .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(false).setMinValue(1).setMaxValue(20))
            .addChannelOption(o => o.setName('channel').setDescription('Channel for giveaway').setRequired(false)))
            .addSubcommand(s => s.setName('end').setDescription('End a giveaway early').addStringOption(o => o.setName('id').setDescription('Giveaway message ID').setRequired(true)))
            .addSubcommand(s => s.setName('reroll').setDescription('Reroll winners').addStringOption(o => o.setName('id').setDescription('Giveaway message ID').setRequired(true)))
            .addSubcommand(s => s.setName('list').setDescription('List active giveaways'))
            .setDMPermission(false));
    }
    parseDuration(str) {
        const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
        const match = str.match(/^(\d+)([smhd])$/i);
        if (!match)
            return 0;
        return parseInt(match[1]) * (units[match[2].toLowerCase()] || 0);
    }
    async startGiveaway(guildId, channelId, prize, duration, winners, hostId, client) {
        const ms = this.parseDuration(duration);
        if (!ms || ms < 10000)
            return { success: false, message: 'Invalid duration. Use format like `1h`, `30m`, `2d`. Minimum 10 seconds.' };
        if (ms > 30 * 86400000)
            return { success: false, message: 'Maximum giveaway duration is 30 days.' };
        const endsAt = new Date(Date.now() + ms);
        const channel = client.channels.cache.get(channelId);
        if (!channel?.isTextBased())
            return { success: false, message: 'Invalid channel.' };
        const description = `**Prize:** ${prize}\n\n**Hosted by:** <@${hostId}>\n**Ends:** <t:${Math.floor(endsAt.getTime() / 1000)}:R>\n**Winners:** ${winners}\n\nClick the button below to enter!`;
        const embed = EmbedManager.premium('🎉 GIVEAWAY!', description).setTimestamp(endsAt);
        const row = ButtonManager.primaryRow([{ label: '🎉 Enter', customId: 'giveaway_enter' }]);
        const msg = await channel.send({ embeds: [embed], components: [row] });
        const prisma = getPrismaClient();
        await prisma.guild.upsert({ where: { guildId }, create: { guildId }, update: {} });
        await prisma.giveaway.create({
            data: {
                guildId, channelId, messageId: msg.id, prize,
                winnersCount: winners, hostId, endsAt, active: true,
            },
        });
        // Schedule end
        setTimeout(async () => {
            await this.endGiveaway(msg.id, guildId, client, false);
        }, ms);
        return { success: true, message: `Giveaway started in <#${channelId}>! Ends <t:${Math.floor(endsAt.getTime() / 1000)}:R>` };
    }
    async endGiveaway(messageId, guildId, client, forced) {
        const prisma = getPrismaClient();
        const giveaway = await prisma.giveaway.findFirst({
            where: { messageId, guildId, active: true },
        });
        if (!giveaway)
            return { success: false, message: 'Giveaway not found or already ended.' };
        const participants = giveaway.participants || [];
        await prisma.giveaway.update({ where: { id: giveaway.id }, data: { active: false, endedAt: new Date() } });
        const channel = client.channels.cache.get(giveaway.channelId);
        let winners = [];
        if (participants.length >= giveaway.winnersCount) {
            const shuffled = [...participants].sort(() => Math.random() - 0.5);
            winners = shuffled.slice(0, giveaway.winnersCount);
        }
        try {
            const msg = await channel?.messages.fetch(messageId);
            const description = `**Prize:** ${giveaway.prize}\n\n**Winners:** ${winners.length ? winners.map((w) => `<@${w}>`).join(', ') : 'No valid participants!'}\n\n**Hosted by:** <@${giveaway.hostId}>`;
            const embed = EmbedManager.giveaway('🎉 GIVEAWAY ENDED!', description);
            await msg?.edit({ embeds: [embed], components: [] });
            if (winners.length) {
                const embed2 = EmbedManager.giveaway('🎉 Congratulations!', `You won **${giveaway.prize}**!`);
                await channel?.send({ content: `🎉 Congratulations ${winners.map((w) => `<@${w}>`).join(', ')}!`, embeds: [embed2] });
            }
            else {
                const embed2 = EmbedManager.info('😔 No Entries', `No valid entries for **${giveaway.prize}**.`);
                await channel?.send({ embeds: [embed2] });
            }
        }
        catch { /* Channel/message may be gone */ }
        return { success: true, message: `Giveaway ended! Winners: ${winners.length ? winners.map((w) => `<@${w}>`).join(', ') : 'None'}`, winners };
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        await i.deferReply({ ephemeral: true });
        if (sub === 'start') {
            const prize = i.options.getString('prize', true);
            const duration = i.options.getString('duration', true);
            const winners = i.options.getInteger('winners') || 1;
            const channel = (i.options.getChannel('channel') || i.channel);
            const result = await this.startGiveaway(i.guildId, channel.id, prize, duration, winners, i.user.id, i.client);
            if (!result.success) {
                await ErrorHandler.generic(i, result.message);
                return;
            }
            await SuccessHandler.configuration(i, 'Giveaway Started', result.message);
        }
        else if (sub === 'end') {
            const id = i.options.getString('id', true);
            const result = await this.endGiveaway(id, i.guildId, i.client, true);
            if (!result.success) {
                await ErrorHandler.generic(i, result.message);
                return;
            }
            await SuccessHandler.configuration(i, 'Giveaway Ended', result.message);
        }
        else if (sub === 'reroll') {
            const id = i.options.getString('id', true);
            const result = await this.endGiveaway(id, i.guildId, i.client, true);
            if (!result.success) {
                await ErrorHandler.generic(i, result.message);
                return;
            }
            await SuccessHandler.configuration(i, 'Giveaway Rerolled', result.message);
        }
        else if (sub === 'list') {
            const prisma = getPrismaClient();
            const giveaways = await prisma.giveaway.findMany({ where: { guildId: i.guildId, active: true } });
            if (!giveaways.length) {
                await ErrorHandler.generic(i, 'No active giveaways.');
                return;
            }
            const description = giveaways.map((g) => `**${g.prize}** — <#${g.channelId}> ends <t:${Math.floor(new Date(g.endsAt).getTime() / 1000)}:R>`).join('\n');
            const embed = EmbedManager.premium('🎉 Active Giveaways', description);
            await i.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(m, _args) {
        const [sub, ...rest] = _args;
        if (sub === 'start') {
            const channelMention = m.mentions.channels.first();
            const channelId = channelMention?.id || m.channelId;
            const durationStr = rest.find(a => /^\d+[smhd]$/i.test(a)) || '1h';
            const winnersStr = rest.find(a => a.startsWith('w:'));
            const winners = winnersStr ? parseInt(winnersStr.split(':')[1]) : 1;
            const prize = rest.filter(a => !a.match(/^\d+[smhd]$/) && !a.match(/^w:\d+/) && !a.match(/^<#/)).join(' ');
            if (!prize) {
                await ErrorHandler.invalidArgument(m, 'prize', 'Prize name');
                return;
            }
            const result = await this.startGiveaway(m.guildId, channelId, prize, durationStr, winners, m.author.id, m.client);
            if (!result.success) {
                await ErrorHandler.generic(m, result.message);
                return;
            }
            const embed = EmbedManager.success('✅ Giveaway Started', result.message);
            await m.reply({ embeds: [embed] });
        }
        else {
            await ErrorHandler.invalidArgument(m, 'subcommand', 'Use `/giveaway start` for full options, or `p!giveaway start <duration> <prize>`');
        }
    }
}
export default GiveawayCommand;
//# sourceMappingURL=giveaway.js.map
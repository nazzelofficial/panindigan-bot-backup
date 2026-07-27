// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayEndCommand extends BaseCommand {
    constructor() {
        super({ name: 'gend', description: 'End a giveaway early and pick winners', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-end', 'gw-end'], examples: ['/gend <id>', 'p!gend <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
            .setDMPermission(false));
    }
    async endGiveaway(guildId, giveawayId, channelFetch) {
        const prisma = getPrismaClient();
        const giveaway = await prisma.giveaway.findFirst({ where: { id: giveawayId, guildId, active: true } });
        if (!giveaway)
            return '❌ Active giveaway not found with that ID.';
        const entries = await prisma.giveawayEntry.findMany({ where: { giveawayId: giveaway.id } });
        if (!entries.length) {
            await prisma.giveaway.update({ where: { id: giveaway.id }, data: { active: false } });
            return '😢 Giveaway ended with no entries.';
        }
        // Pick random winners
        const shuffled = [...entries].sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, giveaway.winnerCount);
        const winnerIds = winners.map(w => w.userId);
        await prisma.giveaway.update({ where: { id: giveaway.id }, data: { active: false, winnerId: winnerIds.join(',') } });
        // Announce in channel
        const channel = channelFetch(giveaway.channelId);
        if (channel?.isTextBased()) {
            const embed = new EmbedBuilder()
                .setTitle('🏆 Giveaway Ended!')
                .setColor(COLORS.gold)
                .setDescription(`The giveaway for **${giveaway.prize}** has ended!`)
                .addFields({ name: '🏆 Winners', value: winnerIds.map(id => `<@${id}>`).join('\n') || 'No winners', inline: false }, { name: '🎁 Prize', value: giveaway.prize, inline: true }, { name: '📊 Total Entries', value: `${entries.length}`, inline: true })
                .setTimestamp();
            await channel.send({ content: `🎉 Congratulations ${winnerIds.map((id) => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**!`, embeds: [embed] });
        }
        return `✅ Giveaway ended! Winners: ${winnerIds.map(id => `<@${id}>`).join(', ')}`;
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        await i.deferReply({ ephemeral: true });
        const result = await this.endGiveaway(i.guildId, id, (cid) => i.guild?.channels.cache.get(cid));
        await i.editReply({ content: result });
    }
    async executePrefix(m, _args) {
        if (!args[0]) {
            await m.reply('❌ Usage: `p!gend <giveaway-id>`');
            return;
        }
        const result = await this.endGiveaway(m.guildId, args[0], (cid) => m.guild?.channels.cache.get(cid));
        await m.reply(result);
    }
}
export default GiveawayEndCommand;

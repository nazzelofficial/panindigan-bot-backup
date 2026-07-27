// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayStartCommand extends BaseCommand {
    constructor() {
        super({ name: 'giveaway-start', description: 'Start an existing giveaway immediately 🎁', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['gstart', 'startgiveaway'], examples: ['/giveaway-start <id>', 'p!giveaway start <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('id').setDescription('Giveaway ID to start').setRequired(true))
            .setDMPermission(false));
    }
    async handle(giveawayId, guildId, send, client) {
        const prisma = getPrismaClient();
        const giveaway = await prisma.giveaway?.findFirst?.({
            where: { id: giveawayId, guildId },
        }).catch(() => null);
        if (!giveaway) {
            await send({ content: '❌ Giveaway not found or already ended.', ephemeral: true });
            return;
        }
        if (giveaway.status === 'active') {
            await send({ content: '❌ This giveaway is already active!', ephemeral: true });
            return;
        }
        if (giveaway.status === 'ended') {
            await send({ content: '❌ This giveaway has already ended.', ephemeral: true });
            return;
        }
        // Update status to active and set startedAt
        await prisma.giveaway?.update?.({
            where: { id: giveawayId },
            data: { status: 'active', startedAt: new Date() },
        }).catch(() => null);
        const endsAt = giveaway.endsAt ? new Date(giveaway.endsAt) : new Date(Date.now() + 60 * 60 * 1000);
        const channel = giveaway.channelId ? client.channels.cache.get(giveaway.channelId) : null;
        const embed = new EmbedBuilder()
            .setTitle(`🎁 ${giveaway.prize || 'Giveaway'}`)
            .setColor(COLORS.gold)
            .addFields({ name: '🏆 Prize', value: giveaway.prize || 'Not specified', inline: true }, { name: '🥇 Winners', value: `${giveaway.winnerCount || 1}`, inline: true }, { name: '⏰ Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true })
            .setDescription('Click the button below to enter the giveaway!')
            .setFooter({ text: `Giveaway ID: ${giveawayId}` })
            .setTimestamp(endsAt);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setCustomId(`giveaway_enter:${giveawayId}`)
            .setLabel('🎁 Enter Giveaway')
            .setStyle(ButtonStyle.Primary));
        if (channel?.isTextBased()) {
            await channel.send({ embeds: [embed], components: [row] });
            await send({ content: `✅ Giveaway **${giveaway.prize || giveawayId}** has been started in <#${channel.id}>!`, ephemeral: true });
        }
        else {
            await send({ embeds: [embed], components: [row] });
        }
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        await this.handle(id, i.guildId, (c) => i.reply(c), i.client);
    }
    async executePrefix(m, _args) {
        if (!args[0]) {
            await m.reply('❌ Usage: `p!giveaway start <id>`');
            return;
        }
        await this.handle(args[0], m.guildId, (c) => m.reply(c), m.client);
    }
}
export default GiveawayStartCommand;

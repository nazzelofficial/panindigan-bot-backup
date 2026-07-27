// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
const TIER_LABELS = {
    bronze: '🥉 Bronze',
    silver: '⭐ Silver',
    gold: '💎 Gold',
    diamond: '👑 Diamond',
};
export class PremiumGiftCommand extends BaseCommand {
    constructor() {
        super({
            name: 'premiumgift',
            description: 'Gift your premium tier to another user (Silver+ required)',
            category: 'premium',
            premiumTier: 'silver',
            cooldown: 86400,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['giftpremium', 'gift'],
            examples: ['/premiumgift @user silver', 'p!premiumgift @user gold'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('User to gift premium to').setRequired(true))
            .addStringOption(o => o.setName('tier').setDescription('Tier to gift').setRequired(true)
            .addChoices({ name: '🥉 Bronze', value: 'bronze' }, { name: '⭐ Silver', value: 'silver' }, { name: '💎 Gold', value: 'gold' }, { name: '👑 Diamond', value: 'diamond' })));
    }
    async doGift(senderId, targetId, tier) {
        if (senderId === targetId) {
            return new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You cannot gift premium to yourself.');
        }
        const prisma = getPrismaClient();
        try {
            const senderPremium = await prisma.premium?.findUnique({ where: { userId: senderId } }).catch(() => null);
            if (!senderPremium?.active) {
                return new EmbedBuilder().setColor(COLORS.error)
                    .setDescription('❌ You need an active premium subscription to gift premium.');
            }
            const TIER_ORDER = ['free', 'bronze', 'silver', 'gold', 'diamond'];
            const senderTierIndex = TIER_ORDER.indexOf(senderPremium.tier || 'free');
            const giftTierIndex = TIER_ORDER.indexOf(tier);
            if (giftTierIndex > senderTierIndex) {
                return new EmbedBuilder().setColor(COLORS.error)
                    .setDescription(`❌ You can only gift tiers equal to or below your own tier (${TIER_LABELS[senderPremium.tier]}).`);
            }
            // Record the gift
            await prisma.premium?.upsert({
                where: { userId: targetId },
                create: { userId: targetId, tier, active: true, giftedBy: senderId, expiresAt: null },
                update: { tier, active: true, giftedBy: senderId },
            }).catch(() => null);
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.premium} Premium Gift Sent!`)
                .setColor(COLORS.gold)
                .setDescription(`🎁 You have gifted **${TIER_LABELS[tier]}** premium to <@${targetId}>!\n\nThank you for your generosity! 💎`)
                .addFields({ name: '🎁 Gift', value: TIER_LABELS[tier], inline: true }, { name: '👤 Recipient', value: `<@${targetId}>`, inline: true })
                .setFooter({ text: 'Premium gifts are permanent — one per user per tier' })
                .setTimestamp();
        }
        catch {
            return new EmbedBuilder().setColor(COLORS.error)
                .setDescription('❌ Failed to process gift. Please try again later.');
        }
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('user', true);
        const tier = interaction.options.getString('tier', true);
        await interaction.deferReply({ ephemeral: true });
        const embed = await this.doGift(interaction.user.id, target.id, tier);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const tier = args[1]?.toLowerCase();
        if (!target) {
            await message.reply(`${EMOJIS.error} Please mention a user to gift to.`);
            return;
        }
        if (!tier || !TIER_LABELS[tier]) {
            await message.reply(`${EMOJIS.error} Please specify a valid tier: \`bronze\`, \`silver\`, \`gold\`, or \`diamond\`.`);
            return;
        }
        const embed = await this.doGift(message.author.id, target.id, tier);
        await message.reply({ embeds: [embed] });
    }
}
export default PremiumGiftCommand;

// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
const PRESET_BACKGROUNDS = [
    { id: 'sunset', label: '🌅 Sunset', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&h=250&fit=crop' },
    { id: 'stars', label: '⭐ Starry Night', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=250&fit=crop' },
    { id: 'flowers', label: '🌸 Cherry Blossoms', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=700&h=250&fit=crop' },
    { id: 'beach', label: '🏖️ Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&h=250&fit=crop' },
    { id: 'forest', label: '🌲 Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&h=250&fit=crop' },
    { id: 'galaxy', label: '🌌 Galaxy', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=700&h=250&fit=crop' },
];
export class CouplebgCommand extends BaseCommand {
    constructor() {
        super({ name: 'couplebg', description: 'Set a custom background for your premium couple profile card 🎨', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['couplebackground', 'setcouplebg'], examples: ['/couplebg sunset', 'p!couplebg stars'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('theme')
            .setDescription('Background theme')
            .setRequired(true)
            .addChoices(...PRESET_BACKGROUNDS.map(b => ({ name: b.label, value: b.id }))))
            .setDMPermission(false));
    }
    async handle(userId, guildId, theme, send) {
        const profile = await coupleProfileService.getProfile(userId, guildId);
        if (!profile) {
            await send({ content: '❌ You are not in a couple!', ephemeral: true });
            return;
        }
        const bg = PRESET_BACKGROUNDS.find(b => b.id === theme);
        if (!bg) {
            await send({ content: '❌ Invalid background theme.', ephemeral: true });
            return;
        }
        const prisma = getPrismaClient();
        await prisma.couple?.update?.({ where: { id: profile.id }, data: { backgroundUrl: bg.url } }).catch(() => null);
        const embed = new EmbedBuilder()
            .setTitle('🎨 Couple Background Updated!')
            .setDescription(`Your couple card background has been set to **${bg.label}**!\n\nUse \`/couplecard\` to see the updated card.`)
            .setImage(bg.url)
            .setColor(0xff69b4)
            .setTimestamp();
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        await this.handle(i.user.id, i.guildId, i.options.getString('theme', true), (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        const theme = args[0]?.toLowerCase();
        if (!theme) {
            const list = PRESET_BACKGROUNDS.map(b => `\`${b.id}\` — ${b.label}`).join('\n');
            await m.reply(`❌ Specify a background theme:\n${list}`);
            return;
        }
        await this.handle(m.author.id, m.guildId, theme, (c) => m.reply(c));
    }
}
export default CouplebgCommand;

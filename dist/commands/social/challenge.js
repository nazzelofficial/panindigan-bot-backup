// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const CHALLENGES = [
    'Have a 1-minute staring contest',
    'Guess each other\'s favorite food',
    'Do 10 push-ups together',
    'Share your most embarrassing memory',
    'Compliment each other 3 times',
    'Teach each other a dance move',
    'Recreate a famous movie scene',
    'Write a haiku about the other person',
    'Sing the first line of your favorite song',
    'Draw each other\'s portrait in 60 seconds',
];
export class ChallengeCommand extends BaseCommand {
    constructor() {
        super({ name: 'challenge', description: 'Send a friendly challenge to another member 🎯', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['dare2', 'friendchallenge'], examples: ['/challenge @user', 'p!challenge @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to challenge').setRequired(true))
            .setDMPermission(false));
    }
    async handle(senderId, targetId, senderName, send) {
        if (senderId === targetId) {
            await send({ content: '❌ You cannot challenge yourself!', ephemeral: true });
            return;
        }
        const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`ch_accept:${targetId}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`ch_decline:${targetId}`).setLabel('❌ Decline').setStyle(ButtonStyle.Danger));
        const embed = new EmbedBuilder()
            .setTitle('🎯 Friendly Challenge!')
            .setDescription(`**${senderName}** challenges <@${targetId}>!\n\n**Challenge:** ${challenge}\n\n<@${targetId}>, do you accept?`)
            .setColor(COLORS.gold)
            .setFooter({ text: 'Challenge expires in 2 minutes' });
        const msg = await send({ embeds: [embed], components: [row] });
        if (!msg)
            return;
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000, filter: (i) => i.user.id === targetId });
        collector.on('collect', async (i) => {
            if (i.customId.startsWith('ch_accept')) {
                await i.update({ embeds: [new EmbedBuilder().setTitle('🎯 Challenge Accepted!').setDescription(`<@${targetId}> accepted the challenge!\n\n**Challenge:** ${challenge}\n\nGood luck! 🍀`).setColor(COLORS.success)], components: [] });
            }
            else {
                await i.update({ embeds: [new EmbedBuilder().setDescription(`<@${targetId}> declined the challenge.`).setColor(COLORS.error)], components: [] });
            }
            collector.stop();
        });
    }
    async executeSlash(i) {
        const t = i.options.getUser('user', true);
        await this.handle(i.user.id, t.id, i.user.username, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        const t = m.mentions.users.first();
        if (!t) {
            await m.reply('❌ Mention someone to challenge!');
            return;
        }
        await this.handle(m.author.id, t.id, m.author.username, (c) => m.reply(c));
    }
}
export default ChallengeCommand;

// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
export class CoupleMessageCommand extends BaseCommand {
    constructor() {
        super({ name: 'couplemessage', description: 'Send a private couple message to your partner 💌', category: 'social', premiumTier: 'gold', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['couplepm', 'lovenote', 'partnermsg'], examples: ['/couplemessage I love you!', 'p!couplemessage Miss you so much!'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('message').setDescription('Message to send to your partner').setRequired(true).setMaxLength(500))
            .setDMPermission(false));
    }
    async handle(userId, guildId, messageText, send, client) {
        if (!messageText?.trim()) {
            await send({ content: '❌ Please provide a message.', ephemeral: true });
            return;
        }
        const profile = await coupleProfileService.getProfile(userId, guildId);
        if (!profile) {
            await send({ content: '❌ You are not in a couple! Use `/marry @user` to propose.', ephemeral: true });
            return;
        }
        const partnerId = profile.userId1 === userId ? profile.userId2 : profile.userId1;
        let sender;
        try {
            sender = await client.users.fetch(userId);
        }
        catch { /* ignored */ }
        // Try to DM the partner
        try {
            const partner = await client.users.fetch(partnerId);
            const dmEmbed = new EmbedBuilder()
                .setTitle('💌 Private Couple Message')
                .setDescription(messageText)
                .setColor(0xff69b4)
                .setAuthor({ name: sender?.username || userId, iconURL: sender?.displayAvatarURL() })
                .setFooter({ text: `Sent from ${guildId} • Panindigan Couple System` })
                .setTimestamp();
            await partner.send({ embeds: [dmEmbed] });
            await send({
                embeds: [new EmbedBuilder()
                        .setTitle('💌 Message Sent!')
                        .setDescription(`Your message was privately delivered to <@${partnerId}>! 💕\n\n> *"${messageText}"*`)
                        .setColor(0xff69b4).setTimestamp()],
                ephemeral: true,
            });
        }
        catch {
            await send({ content: '❌ Could not send message — your partner may have DMs disabled.', ephemeral: true });
        }
    }
    async executeSlash(i) {
        await this.handle(i.user.id, i.guildId, i.options.getString('message', true), (c) => i.reply(c), i.client);
    }
    async executePrefix(m, _args) {
        const text = _args.join(' ');
        await this.handle(m.author.id, m.guildId, text, (c) => m.reply(c), m.client);
    }
}
export default CoupleMessageCommand;

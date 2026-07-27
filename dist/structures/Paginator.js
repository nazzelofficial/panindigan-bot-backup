// @ts-nocheck
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChatInputCommandInteraction, Message, } from 'discord.js';
export class Paginator {
    pages;
    currentPage = 0;
    timeout;
    showPageNumbers;
    allowAllUsers;
    ephemeral;
    constructor(pages, options = {}) {
        if (!pages.length)
            throw new Error('Paginator requires at least one page.');
        this.pages = pages;
        this.timeout = options.timeout ?? 120000;
        this.showPageNumbers = options.showPageNumbers ?? true;
        this.allowAllUsers = options.allowAllUsers ?? false;
        this.ephemeral = options.ephemeral ?? false;
    }
    buildRow(disabled = false) {
        const prev = new ButtonBuilder()
            .setCustomId('paginator_prev')
            .setLabel('◀')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || this.currentPage === 0);
        const pageLabel = new ButtonBuilder()
            .setCustomId('paginator_page')
            .setLabel(`${this.currentPage + 1} / ${this.pages.length}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);
        const next = new ButtonBuilder()
            .setCustomId('paginator_next')
            .setLabel('▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disabled || this.currentPage === this.pages.length - 1);
        const row = new ActionRowBuilder();
        if (this.showPageNumbers) {
            row.addComponents(prev, pageLabel, next);
        }
        else {
            row.addComponents(prev, next);
        }
        return row;
    }
    getCurrentEmbed() {
        const embed = this.pages[this.currentPage];
        if (this.showPageNumbers && this.pages.length > 1) {
            embed.setFooter({ text: `Page ${this.currentPage + 1} of ${this.pages.length}` });
        }
        return embed;
    }
    async send(target, authorId) {
        const components = this.pages.length > 1 ? [this.buildRow()] : [];
        const payload = { embeds: [this.getCurrentEmbed()], components };
        let sentMessage;
        let originalInteraction = null;
        if (target instanceof ChatInputCommandInteraction) {
            originalInteraction = target;
            const replyFn = target.deferred || target.replied
                ? target.editReply.bind(target)
                : (p) => target.reply({ ...p, ephemeral: this.ephemeral });
            const replied = await replyFn(payload);
            sentMessage = replied instanceof Message ? replied : await target.fetchReply();
        }
        else if (target instanceof Message) {
            sentMessage = await target.reply(payload);
        }
        else {
            sentMessage = await target.send(payload);
        }
        if (this.pages.length <= 1)
            return;
        const filter = (i) => {
            if (!this.allowAllUsers && authorId && i.user.id !== authorId) {
                i.reply({ content: '❌ Only the command author can use these buttons.', ephemeral: true });
                return false;
            }
            return i.customId.startsWith('paginator_');
        };
        const collector = sentMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: this.timeout,
            filter,
        });
        collector.on('collect', async (i) => {
            if (i.customId === 'paginator_prev' && this.currentPage > 0) {
                this.currentPage--;
            }
            else if (i.customId === 'paginator_next' && this.currentPage < this.pages.length - 1) {
                this.currentPage++;
            }
            await i.update({ embeds: [this.getCurrentEmbed()], components: [this.buildRow()] });
        });
        collector.on('end', async () => {
            try {
                await sentMessage.edit({ components: [this.buildRow(true)] });
            }
            catch { /* message may have been deleted */ }
        });
    }
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    static fromStrings(items, title, color = 0x5865f2, perPage = 10) {
        const chunks = Paginator.chunk(items, perPage);
        const pages = chunks.map((chunk, idx) => new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(chunk.join('\n'))
            .setFooter({ text: `Page ${idx + 1} of ${chunks.length}` }));
        return new Paginator(pages);
    }
}

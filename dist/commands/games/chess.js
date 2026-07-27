// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
// Simple chess challenge - generates a random chess puzzle position and asks the user to find the best move
const CHESS_CHALLENGES = [
    { fen: 'Scholar\'s Mate', white: 'e4 e5 Qh5 Nc6 Bc4 Nf6??', solution: 'Qxf7# (Scholar\'s Mate)', puzzle: 'White to move — find checkmate in 1!' },
    { fen: 'Fork Setup', white: 'Ng5 attacking both Qd8 and f7', solution: 'Nxf7 (Knight Fork)', puzzle: 'White Knight on g5 — find the fork move!' },
    { fen: 'Pin Tactic', white: 'Bishop pins knight to king', solution: 'Bxd5 winning the pinned piece', puzzle: 'Identify the pin and win material!' },
];
export class ChessCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'chess',
            description: 'Challenge another user to a chess puzzle duel',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['chessgame'],
            examples: ['/chess @user', 'p!chess @user'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('opponent').setDescription('User to challenge').setRequired(true));
    }
    async executeSlash(interaction) {
        const opponent = interaction.options.getUser('opponent', true);
        if (opponent.id === interaction.user.id) {
            await interaction.reply({ content: `${EMOJIS.error} You can't play against yourself!`, ephemeral: true });
            return;
        }
        if (opponent.bot) {
            await interaction.reply({ content: `${EMOJIS.error} You can't challenge a bot!`, ephemeral: true });
            return;
        }
        const puzzle = CHESS_CHALLENGES[Math.floor(Math.random() * CHESS_CHALLENGES.length)];
        const acceptBtn = new ButtonBuilder().setCustomId('chess_accept').setLabel('Accept Challenge').setStyle(ButtonStyle.Success).setEmoji('♟️');
        const declineBtn = new ButtonBuilder().setCustomId('chess_decline').setLabel('Decline').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(acceptBtn, declineBtn);
        const challengeEmbed = new EmbedBuilder()
            .setTitle(`♟️ Chess Challenge!`)
            .setColor(COLORS.warning)
            .setDescription(`${interaction.user} challenges ${opponent} to a chess puzzle!\n\n**Puzzle:** ${puzzle.puzzle}`)
            .addFields({ name: '🎯 How it works', value: 'Both players guess the best chess move. First to answer correctly wins!', inline: false }, { name: '⚔️ Players', value: `⬜ **${interaction.user.username}** (Challenger)\n⬛ **${opponent.username}** (Challenged)`, inline: false })
            .setFooter({ text: `${opponent.username} has 60 seconds to accept.` })
            .setTimestamp();
        const response = await interaction.reply({ content: `${opponent}`, embeds: [challengeEmbed], components: [row] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
        collector.on('collect', async (btn) => {
            if (btn.user.id !== opponent.id) {
                await btn.reply({ content: 'Only the challenged user can respond!', ephemeral: true });
                return;
            }
            collector.stop(btn.customId);
            if (btn.customId === 'chess_decline') {
                await btn.update({ content: `${opponent} declined the chess challenge.`, embeds: [], components: [] });
                return;
            }
            // Game started
            const gameEmbed = new EmbedBuilder()
                .setTitle(`♟️ Chess Puzzle`)
                .setColor(COLORS.info)
                .setDescription(`**${puzzle.puzzle}**\n\nBoth players: type your answer in chat! First correct answer wins.\n\n**Hint:** ${puzzle.white}`)
                .addFields({ name: '✅ Solution', value: `||${puzzle.solution}||`, inline: false })
                .setFooter({ text: `♟️ Use /chess to play again!` })
                .setTimestamp();
            await btn.update({ embeds: [gameEmbed], components: [] });
        });
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                response.edit({ content: 'Challenge expired.', embeds: [], components: [] }).catch(() => { });
            }
        });
    }
    async executePrefix(message, _args) {
        const opponent = message.mentions.users.first();
        if (!opponent || opponent.id === message.author.id) {
            await message.reply(`${EMOJIS.error} Please mention another user to challenge. Example: \`p!chess @user\``);
            return;
        }
        const puzzle = CHESS_CHALLENGES[Math.floor(Math.random() * CHESS_CHALLENGES.length)];
        const embed = new EmbedBuilder()
            .setTitle(`♟️ Chess Challenge`)
            .setColor(COLORS.info)
            .setDescription(`**${message.author.username}** vs **${opponent.username}**\n\n**Puzzle:** ${puzzle.puzzle}\n**Hint:** ${puzzle.white}`)
            .addFields({ name: '✅ Solution (spoiler)', value: `||${puzzle.solution}||`, inline: false })
            .setFooter({ text: '♟️ First to solve wins!' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ChessCommand;

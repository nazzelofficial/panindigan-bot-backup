// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
const SECRET_ITEMS = [
    'Cat', 'Dog', 'Lion', 'Elephant', 'Shark', 'Eagle', 'Butterfly', 'Dragon', 'Unicorn', 'Wolf',
    'Apple', 'Piano', 'Bicycle', 'Telescope', 'Submarine', 'Lighthouse', 'Compass', 'Lantern', 'Anchor', 'Sword',
    'Harry Potter', 'Sherlock Holmes', 'Batman', 'Spider-Man', 'Darth Vader', 'Gandalf', 'Pikachu', 'Mario', 'Sonic', 'Goku',
    'Mount Everest', 'Eiffel Tower', 'Great Wall of China', 'Titanic', 'Amazon River', 'Sahara Desert', 'Niagara Falls', 'Grand Canyon', 'Stonehenge', 'Colosseum',
    'Pizza', 'Sushi', 'Ice Cream', 'Coffee', 'Chocolate', 'Watermelon', 'Pineapple', 'Cheeseburger', 'Ramen', 'Taco',
];
const QUESTIONS = [
    'Is it alive?',
    'Is it bigger than a car?',
    'Can it fly?',
    'Is it found in a home?',
    'Is it a fictional character?',
    'Is it found in nature?',
    'Is it edible?',
    'Is it made by humans?',
    'Is it an animal?',
    'Is it famous worldwide?',
    'Is it found in water?',
    'Does it have legs?',
    'Is it colorful?',
    'Is it from a movie or book?',
    'Can you hold it in your hand?',
    'Is it older than 100 years?',
    'Is it associated with adventure?',
    'Is it something you use daily?',
    'Is it found in a kitchen?',
    'Is it a superhero or villain?',
];
const activeGames = new Map();
export class AkinatorCommand extends BaseCommand {
    constructor() {
        super({
            name: 'akinator',
            description: 'Play a 20 questions guessing game!',
            category: 'games',
            premiumTier: 'bronze',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['20questions', 'guessgame'],
            examples: ['/akinator', 'p!akinator'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(false));
    }
    getRow(gameOver) {
        return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('aki_yes').setLabel('✅ Yes').setStyle(ButtonStyle.Success).setDisabled(gameOver), new ButtonBuilder().setCustomId('aki_no').setLabel('❌ No').setStyle(ButtonStyle.Danger).setDisabled(gameOver), new ButtonBuilder().setCustomId('aki_maybe').setLabel('🤔 Maybe').setStyle(ButtonStyle.Secondary).setDisabled(gameOver), new ButtonBuilder().setCustomId('aki_reveal').setLabel('🎭 Reveal Answer').setStyle(ButtonStyle.Primary).setDisabled(gameOver));
    }
    buildEmbed(state) {
        const q = QUESTIONS[state.questionIndex] ?? 'I have no more questions!';
        const answered = state.answers.map((a, i) => `Q${i + 1}: ${QUESTIONS[i]} — **${a}**`).join('\n') || 'None yet';
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Akinator — Question ${state.questionIndex + 1}/20`)
            .setColor(COLORS.default)
            .setDescription(`**${q}**`)
            .addFields({ name: 'Previous Answers', value: answered.length > 1024 ? answered.slice(-1000) : answered })
            .setFooter({ text: 'Click Yes, No, Maybe, or Reveal Answer' });
    }
    async runGame(channelId, userId, replyFn) {
        if (activeGames.has(channelId)) {
            return;
        }
        const secret = SECRET_ITEMS[Math.floor(Math.random() * SECRET_ITEMS.length)];
        const state = { secret, questionIndex: 0, answers: [], revealed: false };
        activeGames.set(channelId, state);
        const msg = await replyFn(this.buildEmbed(state), this.getRow(false));
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
        collector.on('collect', async (btn) => {
            if (btn.user.id !== userId) {
                await btn.reply({ content: 'This game is not for you!', ephemeral: true });
                return;
            }
            await btn.deferUpdate();
            const gs = activeGames.get(channelId);
            if (!gs)
                return;
            if (btn.customId === 'aki_reveal') {
                gs.revealed = true;
                activeGames.delete(channelId);
                const revealEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} The Answer Was...`)
                    .setColor(COLORS.success)
                    .setDescription(`🎭 I was thinking of: **${gs.secret}**!`)
                    .addFields({ name: 'Your Questions', value: `${gs.answers.length} questions asked` })
                    .setTimestamp();
                await msg.edit({ embeds: [revealEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            const answerMap = { aki_yes: 'Yes', aki_no: 'No', aki_maybe: 'Maybe' };
            gs.answers.push(answerMap[btn.customId] ?? 'Unknown');
            gs.questionIndex++;
            if (gs.questionIndex >= 20) {
                activeGames.delete(channelId);
                const endEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Game Over!`)
                    .setColor(COLORS.gold)
                    .setDescription(`You stumped me! I was thinking of: **${gs.secret}**!`)
                    .setTimestamp();
                await msg.edit({ embeds: [endEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            await msg.edit({ embeds: [this.buildEmbed(gs)], components: [this.getRow(false)] });
        });
        collector.on('end', () => {
            activeGames.delete(channelId);
        });
    }
    async executeSlash(interaction) {
        if (activeGames.has(interaction.channelId)) {
            await interaction.reply({ content: `${EMOJIS.error} A game is already running in this channel!`, ephemeral: true });
            return;
        }
        await interaction.deferReply();
        const state = {
            secret: SECRET_ITEMS[Math.floor(Math.random() * SECRET_ITEMS.length)],
            questionIndex: 0, answers: [], revealed: false,
        };
        activeGames.set(interaction.channelId, state);
        const msg = await interaction.editReply({ embeds: [this.buildEmbed(state)], components: [this.getRow(false)] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
        collector.on('collect', async (btn) => {
            if (btn.user.id !== interaction.user.id) {
                await btn.reply({ content: 'This game is not for you!', ephemeral: true });
                return;
            }
            await btn.deferUpdate();
            const gs = activeGames.get(interaction.channelId);
            if (!gs)
                return;
            if (btn.customId === 'aki_reveal') {
                activeGames.delete(interaction.channelId);
                const revealEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} The Answer Was...`)
                    .setColor(COLORS.success)
                    .setDescription(`🎭 I was thinking of: **${gs.secret}**!`)
                    .addFields({ name: 'Questions Asked', value: `${gs.answers.length}` })
                    .setTimestamp();
                await interaction.editReply({ embeds: [revealEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            const answerMap = { aki_yes: 'Yes', aki_no: 'No', aki_maybe: 'Maybe' };
            gs.answers.push(answerMap[btn.customId] ?? 'Unknown');
            gs.questionIndex++;
            if (gs.questionIndex >= 20) {
                activeGames.delete(interaction.channelId);
                const endEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Game Over!`)
                    .setColor(COLORS.gold)
                    .setDescription(`You stumped me! I was thinking of: **${gs.secret}**!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [endEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            await interaction.editReply({ embeds: [this.buildEmbed(gs)], components: [this.getRow(false)] });
        });
        collector.on('end', () => { activeGames.delete(interaction.channelId); });
    }
    async executePrefix(message, _args) {
        if (activeGames.has(message.channelId)) {
            await message.reply(`${EMOJIS.error} A game is already running in this channel!`);
            return;
        }
        const state = {
            secret: SECRET_ITEMS[Math.floor(Math.random() * SECRET_ITEMS.length)],
            questionIndex: 0, answers: [], revealed: false,
        };
        activeGames.set(message.channelId, state);
        const msg = await message.reply({ embeds: [this.buildEmbed(state)], components: [this.getRow(false)] });
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
        collector.on('collect', async (btn) => {
            if (btn.user.id !== message.author.id) {
                await btn.reply({ content: 'This game is not for you!', ephemeral: true });
                return;
            }
            await btn.deferUpdate();
            const gs = activeGames.get(message.channelId);
            if (!gs)
                return;
            if (btn.customId === 'aki_reveal') {
                activeGames.delete(message.channelId);
                const revealEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} The Answer Was...`)
                    .setColor(COLORS.success)
                    .setDescription(`🎭 I was thinking of: **${gs.secret}**!`)
                    .setTimestamp();
                await msg.edit({ embeds: [revealEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            const answerMap = { aki_yes: 'Yes', aki_no: 'No', aki_maybe: 'Maybe' };
            gs.answers.push(answerMap[btn.customId] ?? 'Unknown');
            gs.questionIndex++;
            if (gs.questionIndex >= 20) {
                activeGames.delete(message.channelId);
                const endEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Game Over!`)
                    .setColor(COLORS.gold)
                    .setDescription(`You stumped me! I was thinking of: **${gs.secret}**!`)
                    .setTimestamp();
                await msg.edit({ embeds: [endEmbed], components: [this.getRow(true)] });
                collector.stop();
                return;
            }
            await msg.edit({ embeds: [this.buildEmbed(gs)], components: [this.getRow(false)] });
        });
        collector.on('end', () => { activeGames.delete(message.channelId); });
    }
}
export default AkinatorCommand;

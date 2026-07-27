// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class TruthOrDareCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'truthordare',
            description: 'Play truth or dare',
            category: 'fun',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['tod'],
            examples: ['/truthordare', 'p!truthordare'],
        };
        super(options);
    }
    truths = [
        'What is your biggest fear?',
        'What is your most embarrassing moment?',
        'Who is your secret crush?',
        'What is the worst thing you\'ve ever done?',
        'What is your biggest regret?',
        'Have you ever lied to get out of trouble?',
        'What is the most childish thing you still do?',
        'What is the weirdest dream you\'ve ever had?',
        'What is your guilty pleasure?',
        'What is the most embarrassing thing in your room?',
    ];
    dares = [
        'Do 10 pushups',
        'Sing a song',
        'Do a silly dance',
        'Talk in an accent for the next 5 minutes',
        'Do your best impression of someone',
        'Post an embarrassing photo',
        'Call someone and sing happy birthday',
        'Eat a spoonful of hot sauce',
        'Do 20 jumping jacks',
        'Speak in rhymes for the next 3 minutes',
    ];
    async executeSlash(interaction) {
        const truth = new ButtonBuilder()
            .setCustomId('truth')
            .setLabel('Truth')
            .setStyle(ButtonStyle.Primary);
        const dare = new ButtonBuilder()
            .setCustomId('dare')
            .setLabel('Dare')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(truth, dare);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎭 Truth or Dare`)
            .setColor(COLORS.info)
            .setDescription('Choose your fate!')
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: [row] });
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (i) => {
            if (i.customId === 'truth') {
                const truthQuestion = this.truths[Math.floor(Math.random() * this.truths.length)];
                const truthEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.fun} 🤔 Truth`)
                    .setColor(COLORS.info)
                    .setDescription(`**Truth:** ${truthQuestion}`)
                    .setTimestamp();
                await i.update({ embeds: [truthEmbed], components: [] });
            }
            else if (i.customId === 'dare') {
                const dareChallenge = this.dares[Math.floor(Math.random() * this.dares.length)];
                const dareEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.fun} 🔥 Dare`)
                    .setColor(COLORS.warning)
                    .setDescription(`**Dare:** ${dareChallenge}`)
                    .setTimestamp();
                await i.update({ embeds: [dareEmbed], components: [] });
            }
            collector.stop();
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('You didn\'t choose in time!')
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        const truth = new ButtonBuilder()
            .setCustomId('truth')
            .setLabel('Truth')
            .setStyle(ButtonStyle.Primary);
        const dare = new ButtonBuilder()
            .setCustomId('dare')
            .setLabel('Dare')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(truth, dare);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎭 Truth or Dare`)
            .setColor(COLORS.info)
            .setDescription('Choose your fate!')
            .setTimestamp();
        await message.reply({ embeds: [embed], components: [row] });
        const collector = message.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (i) => {
            if (i.customId === 'truth') {
                const truthQuestion = this.truths[Math.floor(Math.random() * this.truths.length)];
                const truthEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.fun} 🤔 Truth`)
                    .setColor(COLORS.info)
                    .setDescription(`**Truth:** ${truthQuestion}`)
                    .setTimestamp();
                await i.update({ embeds: [truthEmbed], components: [] });
            }
            else if (i.customId === 'dare') {
                const dareChallenge = this.dares[Math.floor(Math.random() * this.dares.length)];
                const dareEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.fun} 🔥 Dare`)
                    .setColor(COLORS.warning)
                    .setDescription(`**Dare:** ${dareChallenge}`)
                    .setTimestamp();
                await i.update({ embeds: [dareEmbed], components: [] });
            }
            collector.stop();
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription('You didn\'t choose in time!')
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default TruthOrDareCommand;

// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const DATE_IDEAS = [
    '🌅 Watch the sunrise together at a scenic overlook',
    '🎨 Take a painting class and create something together',
    '🍕 Make homemade pizza and have a cozy movie marathon',
    '🌿 Explore a botanical garden and take photos of every flower',
    '⛺ Go stargazing at a campsite with hot cocoa and blankets',
    '🎭 Attend a local theater or improv comedy show',
    '🚴 Rent bikes and explore a new part of your city',
    '🍰 Bake a new recipe together and decorate it',
    '📚 Visit a cozy bookstore and pick a book for each other to read',
    '🎡 Spend a day at an amusement or theme park',
    '🌊 Have a beach bonfire with s\'mores and music',
    '🎲 Host a game night with your favorite board games',
    '🌸 Visit a farmer\'s market and cook a meal from what you find',
    '🎶 Attend a live music concert or open mic night',
    '🛶 Go paddle boating or kayaking on a calm lake',
    '🍜 Try a new restaurant from a cuisine you\'ve never tasted',
    '🧩 Do a 1000-piece puzzle together with your favorite snacks',
    '🎬 Have an outdoor movie night with projector and blankets',
    '🌋 Hike to a waterfall or scenic viewpoint',
    '🎯 Visit a bowling alley or mini-golf course',
    '🍦 Make a sundae bar at home with all your favorite toppings',
    '✈️ Plan a spontaneous day trip to a nearby town you\'ve never visited',
    '🎻 Attend a symphony or classical music performance',
    '🌃 Take a night walk through the city and find a rooftop café',
];
export class DateIdeaCommand extends BaseCommand {
    constructor() {
        super({
            name: 'dateidea',
            description: 'Get a cute date idea for you and your partner! 🌹',
            category: 'social',
            premiumTier: 'free',
            cooldown: 5,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['datenight', 'dateideas'],
            examples: ['/dateidea'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(true);
    }
    async executeSlash(i) {
        try {
            const idea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
            const embed = new EmbedBuilder()
                .setTitle('🌹 Date Idea Generator')
                .setDescription(`**Here's a romantic date idea for you:**\n\n${idea}`)
                .setColor(COLORS.default)
                .setFooter({ text: 'Hope you have an amazing time together! 💕' })
                .setTimestamp();
            await i.reply({ embeds: [embed] });
        }
        catch (err) {
            console.error('[DateIdeaCommand] Error:', err);
            await i.reply({ content: '❌ Could not generate a date idea right now.', ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        try {
            const idea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
            const embed = new EmbedBuilder()
                .setTitle('🌹 Date Idea Generator')
                .setDescription(`**Here's a romantic date idea for you:**\n\n${idea}`)
                .setColor(COLORS.default)
                .setFooter({ text: 'Hope you have an amazing time together! 💕' })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            console.error('[DateIdeaCommand] Error:', err);
            await m.reply('❌ Could not generate a date idea right now.');
        }
    }
}
export default DateIdeaCommand;

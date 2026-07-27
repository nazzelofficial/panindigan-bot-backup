// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class DogCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dog',
            description: 'Get a random dog image',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['puppy', 'woof'],
            examples: ['/dog', 'p!dog'],
        };
        super(options);
    }
    dogFacts = [
        'Dogs have a sense of time and miss you when you\'re gone.',
        'A dog\'s nose print is unique, like a human fingerprint.',
        'Dogs can smell your feelings.',
        'Dogs dream just like humans.',
        'A dog\'s average body temperature is 101.2°F.',
        'Dogs can learn more than 1000 words.',
        'Dogs have three eyelids.',
        'The Basenji is the only breed of dog that can\'t bark.',
        'Dogs can be trained to detect cancer and other diseases.',
        'A Greyhound could beat a Cheetah in a long-distance race.',
    ];
    async executeSlash(interaction) {
        const fact = this.dogFacts[Math.floor(Math.random() * this.dogFacts.length)];
        const dogEmojis = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];
        const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Random Dog`)
            .setColor(COLORS.info)
            .setDescription(fact)
            .setImage('https://dog.ceo/api/breeds/image/random')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const fact = this.dogFacts[Math.floor(Math.random() * this.dogFacts.length)];
        const dogEmojis = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];
        const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${emoji} Random Dog`)
            .setColor(COLORS.info)
            .setDescription(fact)
            .setImage('https://dog.ceo/api/breeds/image/random')
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default DogCommand;

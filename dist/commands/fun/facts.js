// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class FactsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'facts',
            description: 'Get a random interesting fact',
            category: 'fun',
            premiumTier: 'bronze',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['funfact', 'randomfact'],
            examples: ['/facts', 'p!facts'],
        };
        super(options);
    }
    facts = [
        'Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.',
        'A group of flamingos is called a flamboyance.',
        'The shortest war in history was between Britain and Zanzibar in 1896. It lasted 38–45 minutes.',
        'Cows have best friends and become stressed when separated from them.',
        'The Eiffel Tower can grow over 6 inches taller in summer due to thermal expansion.',
        'Octopuses have three hearts and blue blood.',
        'There are more possible iterations of a game of chess than atoms in the known universe.',
        'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
        'A day on Venus is longer than a year on Venus.',
        'Bananas are technically berries, but strawberries are not.',
        'The fingerprints of a koala are so similar to humans that they have confused crime scene investigators.',
        'A bolt of lightning contains enough energy to toast 100,000 slices of bread.',
        'The human nose can detect over 1 trillion different scents.',
        'Hot water can freeze faster than cold water under certain conditions. This is called the Mpemba effect.',
        'Sharks are older than trees. They\'ve been around for about 400 million years.',
        'The average person walks the equivalent of 5 times around the Earth in their lifetime.',
        'A snail can sleep for up to 3 years.',
        'There are more stars in the universe than grains of sand on all the world\'s beaches.',
        'The tongue is the only muscle in the body that is connected at one end only.',
        'Wombats produce cube-shaped feces — the only animals known to do so.',
        'A single cloud can weigh more than a million pounds.',
        'The world\'s oldest known living tree is over 5,000 years old.',
        'Sloths can hold their breath longer than dolphins — up to 40 minutes.',
        'The Hawaiian alphabet has only 13 letters.',
        'Rats laugh when tickled, but at a frequency humans can\'t hear.',
        'The average human body contains enough iron to make a 3-inch nail.',
        'Butterflies taste with their feet.',
        'The Great Wall of China is not visible from space with the naked eye — a common myth.',
        'There is a species of jellyfish (Turritopsis dohrnii) that is considered biologically immortal.',
        'A group of owls is called a parliament.',
        'Sound travels about 4 times faster through water than through air.',
        'The world\'s largest desert is Antarctica, not the Sahara.',
        'Polar bears have black skin and transparent, hollow fur.',
        'The Mona Lisa has no eyebrows — it was fashionable to shave them in Renaissance Florence.',
        'Oxford University is older than the Aztec Empire.',
        'The average person produces enough saliva in their lifetime to fill two swimming pools.',
        'Elephants are the only animals that can\'t jump.',
        'There are more possible games of chess than atoms in the observable universe.',
        'The first computer bug was an actual bug — a moth found in a Harvard computer in 1947.',
        'Crows can recognize and remember human faces, and may hold grudges.',
        'A group of porcupines is called a prickle.',
        'The total weight of all ants on Earth roughly equals the weight of all humans.',
        'Caterpillars completely dissolve inside their cocoons and rebuild themselves as butterflies.',
        'The average cloud is about 1 million tonnes.',
        'A day on Mercury lasts longer than a year on Mercury.',
        'Nintendo was founded in 1889 — originally as a playing card company.',
        'The inventor of the Frisbee was turned into a Frisbee after his death — his ashes were made into one.',
        'Humans share 60% of their DNA with bananas.',
        'The longest English word without a vowel is "rhythms."',
        'There are more atoms in a glass of water than glasses of water in all the oceans on Earth.',
    ];
    async executeSlash(interaction) {
        const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
        const embed = new EmbedBuilder()
            .setTitle('🧠 Interesting Fact')
            .setDescription(fact)
            .setColor(COLORS.info)
            .setFooter({ text: 'Mind = blown 🤯' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
        const embed = new EmbedBuilder()
            .setTitle('🧠 Interesting Fact')
            .setDescription(fact)
            .setColor(COLORS.info)
            .setFooter({ text: 'Mind = blown 🤯' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default FactsCommand;

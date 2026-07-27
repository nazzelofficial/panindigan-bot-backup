// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { EMOJIS, COLORS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
const categoryEmojis = {
    moderation: EMOJIS.moderation,
    admin: EMOJIS.admin,
    music: EMOJIS.music,
    economy: EMOJIS.economy,
    games: EMOJIS.games,
    fun: EMOJIS.fun,
    ai: EMOJIS.ai,
    info: EMOJIS.info,
    utility: EMOJIS.utility,
    social: EMOJIS.social,
    leveling: EMOJIS.leveling,
    giveaway: EMOJIS.giveaway,
    image: EMOJIS.image,
    starboard: EMOJIS.starboard,
    applications: EMOJIS.applications,
    premium: EMOJIS.premium,
    owner: EMOJIS.owner,
    help: EMOJIS.info,
};
export class HelpCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'help',
            description: 'Display the help menu with all commands',
            category: 'help',
            cooldown: 3,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['h', 'commands'],
            examples: ['/help', 'p!help', '/help play', 'p!help music'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getString('target');
        if (target) {
            await this.showCommandHelp(interaction, target);
        }
        else {
            await this.showMainHelp(interaction);
        }
    }
    async executePrefix(message, _args) {
        const target = args[0];
        if (target) {
            await this.showCommandHelp(message, target);
        }
        else {
            await this.showMainHelp(message);
        }
    }
    async showMainHelp(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`🤖 ${client.config.bot.name} v0.1 • All-in-One Discord Bot`)
            .setDescription(`Prefix: \`${client.config.bot.prefix}\` • ${client.commands.size} Commands • 18 Categories`)
            .setColor(COLORS.default)
            .addFields([
            { name: '🆓 Free', value: 'Essential commands — always available', inline: true },
            { name: '💎 Premium', value: 'Bronze→Diamond — feature-based tiers', inline: true },
            { name: '🔑 Owner', value: 'System-level control', inline: true },
        ])
            .setFooter({ text: 'Use the buttons below to browse command categories' });
        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('help_moderation')
            .setLabel('🛡️ Mod')
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId('help_admin')
            .setLabel('👑 Admin')
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId('help_music')
            .setLabel('🎵 Music')
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId('help_economy')
            .setLabel('💰 Economy')
            .setStyle(ButtonStyle.Primary), new ButtonBuilder()
            .setCustomId('help_games')
            .setLabel('🎮 Games')
            .setStyle(ButtonStyle.Primary));
        const row2 = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('help_fun')
            .setLabel('🎉 Fun')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('help_ai')
            .setLabel('🤖 AI')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('help_info')
            .setLabel('ℹ️ Info')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('help_utility')
            .setLabel('🔧 Utility')
            .setStyle(ButtonStyle.Secondary), new ButtonBuilder()
            .setCustomId('help_social')
            .setLabel('🌐 Social')
            .setStyle(ButtonStyle.Secondary));
        const row3 = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('help_leveling')
            .setLabel('📈 Level')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('help_giveaway')
            .setLabel('🎁 Giveaway')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('help_image')
            .setLabel('🖼️ Image')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('help_starboard')
            .setLabel('⭐ Starboard')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('help_applications')
            .setLabel('📝 Apply')
            .setStyle(ButtonStyle.Success));
        const row4 = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('help_premium')
            .setLabel('💎 Premium')
            .setStyle(ButtonStyle.Danger), new ButtonBuilder()
            .setCustomId('help_owner')
            .setLabel('🔑 Owner')
            .setStyle(ButtonStyle.Danger), new ButtonBuilder()
            .setCustomId('help_main')
            .setLabel('🏠 Home')
            .setStyle(ButtonStyle.Secondary));
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed], components: [row, row2, row3, row4] });
        }
        else {
            await interaction.reply({ embeds: [embed], components: [row, row2, row3, row4] });
        }
    }
    async showCommandHelp(interaction, target) {
        const client = interaction.client;
        const command = client.commands.get(target.toLowerCase());
        if (!command) {
            const categoryCommands = client.commands.filter(cmd => cmd.category === target.toLowerCase());
            if (categoryCommands.size > 0) {
                await this.showCategoryHelp(interaction, target.toLowerCase());
            }
            else {
                if (interaction instanceof ChatInputCommandInteraction) {
                    await interaction.reply({ content: `❌ Command or category "${target}" not found.`, ephemeral: true });
                }
                else {
                    await interaction.reply(`❌ Command or category "${target}" not found.`);
                }
            }
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${categoryEmojis[command.category] || '📌'} ${command.name}`)
            .setDescription(command.description)
            .setColor(COLORS[command.category] || COLORS.default)
            .addFields([
            { name: 'Category', value: Formatter.capitalizeFirst(command.category), inline: true },
            { name: 'Premium Tier', value: command.premiumTier.toUpperCase(), inline: true },
            { name: 'Cooldown', value: `${command.cooldown}s`, inline: true },
            { name: 'Slash Command', value: command.slashCommand ? '✅' : '❌', inline: true },
            { name: 'Prefix Command', value: command.prefixCommand ? '✅' : '❌', inline: true },
            { name: 'Guild Only', value: command.guildOnly ? '✅' : '❌', inline: true },
        ]);
        if (command.aliases.length > 0) {
            embed.addField('Aliases', command.aliases.map(a => `\`${a}\``).join(', '));
        }
        if (command.examples.length > 0) {
            embed.addField('Examples', command.examples.map(e => `\`${e}\``).join('\n'));
        }
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
    async showCategoryHelp(interaction, category) {
        const client = interaction.client;
        const commands = client.commands.filter(cmd => cmd.category === category);
        const embed = new EmbedBuilder()
            .setTitle(`${categoryEmojis[category] || '📌'} ${Formatter.capitalizeFirst(category)} Commands`)
            .setDescription(`Total: ${commands.size} commands`)
            .setColor(COLORS[category] || COLORS.default);
        const commandList = Array.from(commands.values())
            .filter(cmd => cmd.name === Object.keys(cmd).find(k => cmd[k] === cmd))
            .map(cmd => `\`${cmd.name}\` - ${cmd.description}`)
            .join('\n');
        embed.addField('Commands', commandList.substring(0, 1024));
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default HelpCommand;

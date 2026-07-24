import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/xUA7b1MxpngddUvdgc/giphy.gif'];
export class StareCommand extends BaseCommand {
  constructor() { super({ name: 'stare', description: 'Stare at someone! 👀', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['glare'], examples: ['/stare @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to stare at').setRequired(true))) as SlashCommandBuilder; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`👀 **${i.user.username}** stares at **${t.username}**...`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`👀 **${m.author.username}** stares at **${t.username}**...`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default StareCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif'];
export class NomCommand extends BaseCommand {
  constructor() { super({ name: 'nom', description: 'Nom on someone! 😋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['eat'], examples: ['/nom @user'] } as CommandOptions); }
  public buildSlashCommand(): SlashCommandBuilder { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to nom').setRequired(true))) as SlashCommandBuilder; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`😋 **${i.user.username}** noms on **${t.username}**!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention someone!'); return; } await m.reply({ embeds: [new EmbedBuilder().setDescription(`😋 **${m.author.username}** noms on **${t.username}**!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default NomCommand;

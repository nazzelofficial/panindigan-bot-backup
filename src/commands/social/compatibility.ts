// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { compatibilityService } from '../../features/couple/CompatibilityService.js';

export class CompatibilityCommand extends BaseCommand {
  constructor() {
    super({ name: 'compatibility', description: 'Check compatibility between two users 💕', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['compat', 'lovemeter', 'ship'], examples: ['/compatibility @user1 @user2', 'p!compatibility @user1 @user2'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
      .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(false))) as SlashCommandBuilder;
  }
  private makeEmbed(u1Tag: string, u1Id: string, u2Tag: string, u2Id: string) {
    const score = compatibilityService.calculateCompatibility(u1Id, u2Id);
    const { emoji, label, description } = compatibilityService.getCompatibilityMessage(score);
    const bar = compatibilityService.getCompatibilityBar(score);
    return new EmbedBuilder()
      .setTitle(`${emoji} Compatibility Check`)
      .setDescription(`**${u1Tag}** 💕 **${u2Tag}**\n\n${bar}\n\n**${label}** — *${description}*`)
      .setColor(COLORS.gold).setTimestamp();
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const u1 = i.options.getUser('user1', true);
    const u2 = i.options.getUser('user2') || i.user;
    await i.reply({ embeds: [this.makeEmbed(u1.username, u1.id, u2.username, u2.id)] });
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const users = m.mentions.users;
    const u1 = users.first() || m.author;
    const u2 = users.size >= 2 ? users.at(1)! : m.author;
    await m.reply({ embeds: [this.makeEmbed(u1.username, u1.id, u2.username, u2.id)] });
  }
}
export default CompatibilityCommand;

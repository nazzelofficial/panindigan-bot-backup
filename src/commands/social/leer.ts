// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/l41YeK5LbQPEFbJQA/giphy.gif',
  'https://media.giphy.com/media/LPFmvBfIBsO3S/giphy.gif',
  'https://media.giphy.com/media/nVXzt7FSJCGfe/giphy.gif',
];

export class LeerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'leer',
      description: 'Give someone a playful leer 👀',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['eyeing'],
      examples: ['/leer @user', 'p!leer @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to leer at').setRequired(false))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user');
      const desc = t
        ? `👀 **${i.user.username}** gives **${t.username}** a playful leer...`
        : `👀 **${i.user.username}** is leering at everyone...`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      const desc = t
        ? `👀 **${m.author.username}** gives **${t.username}** a playful leer...`
        : `👀 **${m.author.username}** is leering at everyone...`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default LeerCommand;

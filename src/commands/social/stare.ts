import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/xUA7b1MxpngddUvdgc/giphy.gif',
  'https://media.giphy.com/media/l1KVaj5UcbHwrBMqI/giphy.gif',
  'https://media.giphy.com/media/RH1IFq2GT0Oau8NRWX/giphy.gif',
  'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif',
  'https://media.giphy.com/media/xT9DPjnBQnpCwBAmre/giphy.gif',
  'https://media.giphy.com/media/3o6Zt0hNCfak3QCqsw/giphy.gif',
];

const MESSAGES = [
  '{user} stares intensely at {target}... 👀',
  '{user} gives {target} a long piercing stare 😑',
  '{user} is watching {target} very closely... 👁️',
  '{user} cannot stop staring at {target} 😶',
  '{user} fixes their gaze on {target} without blinking 👀',
];

export class StareCommand extends BaseCommand {
  constructor() {
    super({ name: 'stare', description: 'Stare intensely at someone! 👀', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['glare', 'gaze'], examples: ['/stare @user', 'p!stare @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to stare at').setRequired(true))
      .setDMPermission(true)) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  private msg(user: string, target: string) {
    const tpl = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    return tpl.replace('{user}', `**${user}**`).replace('{target}', `**${target}**`);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user', true);
    await i.reply({ embeds: [new EmbedBuilder().setDescription(this.msg(i.user.username, t.username)).setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' })] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const t = m.mentions.users.first();
    if (!t) { await m.reply('❌ Mention someone to stare at!'); return; }
    await m.reply({ embeds: [new EmbedBuilder().setDescription(this.msg(m.author.username, t.username)).setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' })] });
  }
}
export default StareCommand;

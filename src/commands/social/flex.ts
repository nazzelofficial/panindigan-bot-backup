import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif',
  'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
  'https://media.giphy.com/media/5hc2pFFBLcgMnfCgmf/giphy.gif',
];

export class FlexCommand extends BaseCommand {
  constructor() {
    super({ name: 'flex', description: 'Flex your muscles! 💪', category: 'social', premiumTier: 'silver', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['showoff', 'muscle'], examples: ['/flex', 'p!flex'] } as CommandOptions);
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setDescription(`💪 **${i.user.username}** is flexing their muscles! 💪`)
      .setImage(this.gif()).setColor(COLORS.gold).setFooter({ text: 'Panindigan Social' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setDescription(`💪 **${m.author.username}** is flexing their muscles! 💪`)
      .setImage(this.gif()).setColor(COLORS.gold).setFooter({ text: 'Panindigan Social' });
    await m.reply({ embeds: [embed] });
  }
}
export default FlexCommand;

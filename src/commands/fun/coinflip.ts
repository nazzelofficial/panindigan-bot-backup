// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE } from '../../utils/EmbedSystem.js';

export class CoinflipCommand extends BaseCommand {
  constructor() {
    super({
      name: 'coinflip', description: 'Flip a coin', category: 'fun',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['flip', 'coin', 'cf'], examples: ['/coinflip', 'p!coinflip'],
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const heads = Math.random() < 0.5;
    await interaction.reply({ embeds: [this.build(heads, interaction.user)] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const heads = Math.random() < 0.5;
    await message.reply({ embeds: [this.build(heads, message.author)] });
  }

  private build(heads: boolean, user: any): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(heads ? PALETTE.success : PALETTE.warning)
      .setDescription(`${heads ? '🪙 **Heads!**' : '🪙 **Tails!**'}\n\n*${user.username} flipped a coin...*`)
      .setFooter({ text: '50/50 — pure luck!' })
      .setTimestamp();
  }
}
export default CoinflipCommand;

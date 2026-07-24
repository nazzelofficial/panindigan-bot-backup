import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ScreamCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'scream',
      description: 'Scream (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['yell', 'shout'],
      examples: ['/scream', 'p!scream'],
    };
    super(options);
  }

  private screamMessages = [
    'screams AHHHHH! 😱',
    'yells at the top of their lungs! 🗣️',
    'screams in frustration! 😤',
    'lets out a loud scream! 😱',
    'shouts AAAHHH! 🗣️',
    'screams dramatically! 😤',
    'yells HELP! 😱',
    'screams into the void! 🗣️',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.screamMessages[Math.floor(Math.random() * this.screamMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😱 Scream`)
      .setColor(COLORS.warning)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const screamMessage = this.screamMessages[Math.floor(Math.random() * this.screamMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😱 Scream`)
      .setColor(COLORS.warning)
      .setDescription(`${message.author} ${screamMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ScreamCommand;

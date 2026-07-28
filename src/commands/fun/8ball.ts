// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';

const RESPONSES = [
  // Positive (10)
  { text: 'It is certain.',         type: 'positive', emoji: '🟢' },
  { text: 'Without a doubt.',       type: 'positive', emoji: '🟢' },
  { text: 'Yes, definitely!',       type: 'positive', emoji: '🟢' },
  { text: 'You may rely on it.',    type: 'positive', emoji: '🟢' },
  { text: 'As I see it, yes.',      type: 'positive', emoji: '🟢' },
  { text: 'Most likely.',           type: 'positive', emoji: '🟢' },
  { text: 'Outlook good.',          type: 'positive', emoji: '🟢' },
  { text: 'Signs point to yes.',    type: 'positive', emoji: '🟢' },
  { text: 'Yes!',                   type: 'positive', emoji: '🟢' },
  { text: 'Absolutely.',            type: 'positive', emoji: '🟢' },
  // Neutral (5)
  { text: 'Reply hazy, try again.', type: 'neutral',  emoji: '🟡' },
  { text: 'Ask again later.',       type: 'neutral',  emoji: '🟡' },
  { text: 'Better not tell you now.', type: 'neutral', emoji: '🟡' },
  { text: 'Cannot predict now.',    type: 'neutral',  emoji: '🟡' },
  { text: 'Concentrate and ask again.', type: 'neutral', emoji: '🟡' },
  // Negative (5)
  { text: "Don't count on it.",     type: 'negative', emoji: '🔴' },
  { text: 'My reply is no.',        type: 'negative', emoji: '🔴' },
  { text: 'My sources say no.',     type: 'negative', emoji: '🔴' },
  { text: 'Outlook not so good.',   type: 'negative', emoji: '🔴' },
  { text: 'Very doubtful.',         type: 'negative', emoji: '🔴' },
];

export class EightBallCommand extends BaseCommand {
  constructor() {
    super({
      name: '8ball', description: 'Ask the magic 8-ball a question', category: 'fun',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: false,
      slashCommand: true, prefixCommand: true,
      aliases: ['magic8ball', 'eightball', '8b'],
      examples: ['/8ball Will I win?', 'p!8ball Will I pass?'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('question').setDescription('Ask the magic 8-ball anything').setRequired(true)) as SlashCommandBuilder;
  }

  private buildEmbed(question: string, user: any): EmbedBuilder {
    const r = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
    const color = r.type === 'positive' ? PALETTE.success : r.type === 'negative' ? PALETTE.error : PALETTE.warning;

    return new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: `${user.username} asks the 8-ball`, iconURL: user.displayAvatarURL({ size: 64 }) })
      .setDescription(`🎱 **Magic 8-Ball**`)
      .addFields(
        { name: '❓ Question', value: question,                 inline: false },
        { name: `${r.emoji} Answer`, value: `**${r.text}**`,   inline: false },
      )
      .setFooter({ text: 'The 8-ball has spoken.' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    await interaction.reply({ embeds: [this.buildEmbed(question, interaction.user)] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const question = args.join(' ');
    if (!question) return void message.reply({ embeds: [errorEmbed('No Question', 'Please ask a question! e.g. `p!8ball Will I win?`')] });
    await message.reply({ embeds: [this.buildEmbed(question, message.author)] });
  }
}
export default EightBallCommand;

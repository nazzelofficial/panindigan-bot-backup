// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

const RIDDLES = [
  { q: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?', a: 'map', hint: 'You use me for navigation.' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps', hint: 'Think about walking.' },
  { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a: 'echo', hint: 'You hear me in mountains and tunnels.' },
  { q: 'I have hands but can\'t clap. What am I?', a: 'clock', hint: 'I tell you the time.' },
  { q: 'What has to be broken before you can use it?', a: 'egg', hint: 'You crack me for breakfast.' },
  { q: 'I\'m light as a feather, but the strongest man can\'t hold me for more than a few minutes. What am I?', a: 'breath', hint: 'You do it constantly.' },
  { q: 'What begins with T, ends with T, and has T in it?', a: 'teapot', hint: 'You make hot drinks in it.' },
  { q: 'The more you have of it, the less you see. What is it?', a: 'darkness', hint: 'It\'s the opposite of light.' },
  { q: 'What can travel around the world while staying in a corner?', a: 'stamp', hint: 'You put me on an envelope.' },
  { q: 'I\'m always in front of you but can\'t be seen. What am I?', a: 'future', hint: 'Time-related.' },
  { q: 'What has an eye but cannot see?', a: 'needle', hint: 'You use it to sew.' },
  { q: 'What gets wetter as it dries?', a: 'towel', hint: 'You use me after a shower.' },
  { q: 'What can you catch but not throw?', a: 'cold', hint: 'You feel sick when you have it.' },
  { q: 'I have no doors but I have keys. I have no rooms but I have space. What am I?', a: 'keyboard', hint: 'You\'re probably using one now.' },
  { q: 'What is full of holes but still holds water?', a: 'sponge', hint: 'Used for washing dishes.' },
];

export class RiddleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'riddle',
      description: 'Answer a riddle — use hints if you\'re stuck!',
      category: 'games',
      premiumTier: 'free',
      cooldown: 10,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bugtong', 'puzzle'],
      examples: ['/riddle', 'p!riddle'],
    } as CommandOptions);
  }

  private async runRiddle(
    reply: (c: any) => Promise<any>,
    editReply: (c: any) => Promise<any>,
    channel: any,
    userId: string,
    username: string,
  ) {
    const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    let hintUsed = false;

    const hintRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('riddle_hint').setLabel('💡 Get Hint').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('riddle_give_up').setLabel('🏳️ Give Up').setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Riddle Time!`)
      .setColor(COLORS.info)
      .setDescription(`❓ **${riddle.q}**\n\nType your answer in chat! You have 60 seconds.`)
      .setFooter({ text: `${username} • Use the buttons below for help` })
      .setTimestamp();

    await reply({ embeds: [embed], components: [hintRow] });

    const buttonCollector = channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (i: any) => i.user.id === userId,
    });

    const msgCollector = channel.createMessageCollector({
      time: 60000,
      filter: (m: any) => m.author.id === userId,
    });

    buttonCollector.on('collect', async (i: any) => {
      if (i.customId === 'riddle_hint' && !hintUsed) {
        hintUsed = true;
        await i.reply({ content: `💡 **Hint:** ${riddle.hint}`, ephemeral: true });
      } else if (i.customId === 'riddle_give_up') {
        msgCollector.stop();
        buttonCollector.stop();
        const giveUpEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Riddle — Answer Revealed`)
          .setColor(COLORS.warning)
          .setDescription(`❓ **${riddle.q}**\n\n✅ The answer was: **${riddle.a}**`)
          .setTimestamp();
        await i.update({ embeds: [giveUpEmbed], components: [] });
      }
    });

    msgCollector.on('collect', async (m: any) => {
      if (m.content.trim().toLowerCase() === riddle.a.toLowerCase()) {
        msgCollector.stop('answered');
        buttonCollector.stop();
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct! 🎉`)
          .setColor(COLORS.success)
          .setDescription(`✅ **${m.author.username}** got it right!\n\nThe answer was: **${riddle.a}**${hintUsed ? '\n*(Hint was used)*' : ''}`)
          .setTimestamp();
        await editReply({ embeds: [winEmbed], components: [] });
      }
    });

    msgCollector.on('end', async (_: any, reason: string) => {
      if (reason !== 'answered') {
        buttonCollector.stop();
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Time\'s Up!`)
          .setColor(COLORS.error)
          .setDescription(`❓ **${riddle.q}**\n\n✅ The answer was: **${riddle.a}**`)
          .setTimestamp();
        await editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.runRiddle(
      (c) => interaction.reply(c),
      (c) => interaction.editReply(c),
      interaction.channel,
      interaction.user.id,
      interaction.user.username,
    );
  }

  public async executePrefix(message: Message): Promise<void> {
    let sent: Message;
    await this.runRiddle(
      async (c) => { sent = await message.reply(c); return sent; },
      async (c) => sent!.edit(c),
      message.channel,
      message.author.id,
      message.author.username,
    );
  }
}

export default RiddleCommand;

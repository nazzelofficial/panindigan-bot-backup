// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class DedicateSongCommand extends BaseCommand {
  constructor() {
    super({
      name: 'dedicatesong',
      description: 'Dedicate a song to your partner 🎵💕',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['song', 'dedicatesong', 'songfor'],
      examples: ['/dedicatesong @user "Perfect" by Ed Sheeran', '/dedicatesong @user "Thinking Out Loud" Just for you!'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user').setDescription('Who to dedicate the song to').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('song').setDescription('Song name and artist (e.g. "Perfect" by Ed Sheeran)').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('message').setDescription('Add a personal message (optional)').setRequired(false)
      )
      .setDMPermission(true)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const target = i.options.getUser('user', true);
      const song = i.options.getString('song', true);
      const personal = i.options.getString('message');

      if (target.id === i.user.id) {
        await i.reply({ content: '❌ You cannot dedicate a song to yourself!', ephemeral: true });
        return;
      }

      if (target.bot) {
        await i.reply({ content: '❌ Bots don\'t have ears for music! 🤖🎵', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🎵 Song Dedication 💕')
        .setDescription(
          `${i.user.toString()} dedicates a song to ${target.toString()}! 🎶\n\n` +
          `🎼 **Song:** ${song}\n\n` +
          (personal ? `💬 **Message:** *"${personal}"*\n\n` : '') +
          `*May this song fill your heart with warmth and love* 💖`
        )
        .setColor(COLORS.default)
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: 'Music is the language of the soul 🎵💕' })
        .setTimestamp();

      await i.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[DedicateSongCommand] Error:', err);
      await i.reply({ content: '❌ Could not send the song dedication. Please try again.', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const target = m.mentions.users.first();
      if (!target) {
        await m.reply('❌ Please mention a user! Example: `dedicatesong @user "Perfect" by Ed Sheeran`');
        return;
      }

      if (target.id === m.author.id) {
        await m.reply('❌ You cannot dedicate a song to yourself!');
        return;
      }

      if (target.bot) {
        await m.reply('❌ Bots don\'t have ears for music! 🤖🎵');
        return;
      }

      const remaining = _args.slice(1).join(' ');
      if (!remaining) {
        await m.reply('❌ Please provide a song name! Example: `dedicatesong @user "Perfect" by Ed Sheeran`');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🎵 Song Dedication 💕')
        .setDescription(
          `${m.author.toString()} dedicates a song to ${target.toString()}! 🎶\n\n` +
          `🎼 **Song:** ${remaining}\n\n` +
          `*May this song fill your heart with warmth and love* 💖`
        )
        .setColor(COLORS.default)
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: 'Music is the language of the soul 🎵💕' })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[DedicateSongCommand] Error:', err);
      await m.reply('❌ Could not send the song dedication. Please try again.');
    }
  }
}

export default DedicateSongCommand;

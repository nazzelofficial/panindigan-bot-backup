import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class EarlyAccessCommand extends BaseCommand {
  constructor() {
    super({ name: 'earlyaccess', description: 'View upcoming features in early access (Diamond perk)', category: 'premium', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['beta', 'upcoming'], examples: ['/earlyaccess'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder().setTitle('💎 Diamond Early Access').setColor(COLORS.diamond)
      .setDescription('As a Diamond subscriber, you have early access to these upcoming features:')
      .addFields(
        { name: '🤖 AI Voice Chat (Beta)', value: 'Talk to the bot using voice in voice channels', inline: false },
        { name: '📱 Mobile Companion App (Beta)', value: 'Control the bot from your phone', inline: false },
        { name: '🎵 Spotify Integration (Beta)', value: 'Play directly from your Spotify account', inline: false },
        { name: '🎨 Custom Bot Avatar (Beta)', value: 'Set a server-specific bot avatar', inline: false },
        { name: '📊 Advanced Analytics (Beta)', value: 'Detailed server growth and engagement metrics', inline: false },
        { name: '🌐 Multi-Language AI (Beta)', value: 'AI that auto-detects and responds in your language', inline: false },
      )
      .setFooter({ text: 'Diamond Premium — ₱399 one-time | Features are in beta and may be unstable' });
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const embed = new EmbedBuilder().setTitle('💎 Early Access').setColor(COLORS.diamond)
      .setDescription('AI Voice Chat | Mobile App | Spotify | Custom Avatar | Analytics — All in beta for Diamond subscribers!');
    await m.reply({ embeds: [embed] });
  }
}
export default EarlyAccessCommand;

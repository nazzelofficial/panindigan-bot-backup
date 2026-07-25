import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

const BACKGROUNDS = [
  { id: 'default', label: '🌑 Default Dark', premium: false },
  { id: 'galaxy', label: '🌌 Galaxy', premium: false },
  { id: 'sunset', label: '🌅 Sunset', premium: false },
  { id: 'forest', label: '🌲 Forest', premium: true },
  { id: 'city', label: '🏙️ City Lights', premium: true },
  { id: 'ocean', label: '🌊 Ocean', premium: true },
  { id: 'anime', label: '🎌 Anime', premium: true },
  { id: 'custom', label: '🎨 Custom URL (Diamond)', premium: true },
];

export class BackgroundCommand extends BaseCommand {
  constructor() {
    super({ name: 'background', description: 'Set your profile background image (Diamond) 🎨', category: 'social', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['setbg', 'profilebg', 'bg'], examples: ['/background galaxy', '/background custom https://...', 'p!background sunset'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('theme')
        .setDescription('Background theme')
        .setRequired(true)
        .addChoices(...BACKGROUNDS.filter(b => b.id !== 'custom').map(b => ({ name: b.label, value: b.id })), { name: '🎨 Custom URL', value: 'custom' }))
      .addStringOption(o => o.setName('url').setDescription('Custom image URL (if theme is custom)').setRequired(false))) as SlashCommandBuilder;
  }

  private async handle(userId: string, theme: string, customUrl: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    let bgValue = theme;
    if (theme === 'custom') {
      if (!customUrl) { await send({ content: '❌ Provide a URL for custom background.', ephemeral: true }); return; }
      try { new URL(customUrl); } catch { await send({ content: '❌ Invalid URL.', ephemeral: true }); return; }
      bgValue = customUrl;
    }

    await prisma.user.upsert({
      where: { userId },
      create: { userId, profileBackground: bgValue } as any,
      update: { profileBackground: bgValue } as any,
    }).catch(() => null);

    const bg = BACKGROUNDS.find(b => b.id === theme);
    const embed = new EmbedBuilder()
      .setTitle('🎨 Profile Background Updated!')
      .setDescription(`Your profile background has been set to **${bg?.label || theme}**!\n\nUse \`/profile\` to see your updated profile card.`)
      .setColor(COLORS.diamond)
      .setTimestamp();

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await this.handle(i.user.id, i.options.getString('theme', true), i.options.getString('url'), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const theme = args[0]?.toLowerCase() || 'default';
    const customUrl = theme === 'custom' ? args[1] : null;
    await this.handle(m.author.id, theme, customUrl, (c) => m.reply(c));
  }
}
export default BackgroundCommand;

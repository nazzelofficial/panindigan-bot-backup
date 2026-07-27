// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const TROPHY_DEFS: Record<string, { emoji: string; name: string; desc: string; rarity: string }> = {
  'first_win': { emoji: '🥇', name: 'First Victory', desc: 'Won your first game', rarity: 'Common' },
  'trivia_master': { emoji: '🧠', name: 'Trivia Master', desc: 'Answered 50 trivia questions correctly', rarity: 'Rare' },
  'economy_king': { emoji: '💰', name: 'Economy King', desc: 'Reached 1,000,000 coins', rarity: 'Legendary' },
  'social_legend': { emoji: '🌐', name: 'Social Legend', desc: 'Used social commands 500 times', rarity: 'Epic' },
  'music_maestro': { emoji: '🎵', name: 'Music Maestro', desc: 'Played 1000 songs', rarity: 'Rare' },
  'ai_whisperer': { emoji: '🤖', name: 'AI Whisperer', desc: 'Used AI commands 200 times', rarity: 'Uncommon' },
  'couple_forever': { emoji: '💑', name: 'Forever Together', desc: 'In a couple for 365 days', rarity: 'Legendary' },
  'server_guardian': { emoji: '🛡️', name: 'Server Guardian', desc: 'Moderated 100 users', rarity: 'Epic' },
  'giveaway_winner': { emoji: '🎁', name: 'Lucky Winner', desc: 'Won 3 giveaways', rarity: 'Rare' },
};

const RARITY_COLORS: Record<string, number> = {
  'Common': COLORS.default,
  'Uncommon': 0x00cc00,
  'Rare': 0x0099ff,
  'Epic': 0x9900cc,
  'Legendary': COLORS.gold,
};

export class TrophyCommand extends BaseCommand {
  constructor() {
    super({ name: 'trophy', description: 'View your trophy case and achievements (Diamond) 🏆', category: 'social', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['trophies', 'troptycase'], examples: ['/trophy', '/trophy @user', 'p!trophy'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('View another user\'s trophies').setRequired(false))) as SlashCommandBuilder;
  }

  private async handle(userId: string, send: (c: any) => Promise<any>, client: any): Promise<void> {
    const prisma = getPrismaClient();
    const userData = await prisma.user.findUnique({ where: { userId } }).catch(() => null);
    const trophies: string[] = (userData as any)?.trophies || [];

    let user;
    try { user = await client.users.fetch(userId); } catch { /* ignored */ }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Trophy Case — ${user?.username || userId}`)
      .setTimestamp();

    if (user) embed.setThumbnail(user.displayAvatarURL({ extension: 'png', size: 128 }));

    if (trophies.length === 0) {
      embed.setColor(COLORS.default)
        .setDescription('No trophies earned yet! Keep playing, moderating, and being active to earn trophies.');
    } else {
      const earnedTrophies = trophies.map(t => TROPHY_DEFS[t]).filter(Boolean);
      const grouped: Record<string, typeof TROPHY_DEFS[string][]> = {};
      earnedTrophies.forEach(t => { if (!grouped[t.rarity]) grouped[t.rarity] = []; grouped[t.rarity].push(t); });

      const dominantRarity = earnedTrophies.sort((a, b) => Object.keys(RARITY_COLORS).indexOf(b.rarity) - Object.keys(RARITY_COLORS).indexOf(a.rarity))[0]?.rarity || 'Common';
      embed.setColor(RARITY_COLORS[dominantRarity]);

      for (const [rarity, ts] of Object.entries(grouped)) {
        embed.addFields({ name: `${rarity} Trophies`, value: ts.map(t => `${t.emoji} **${t.name}** — ${t.desc}`).join('\n'), inline: false });
      }
    }

    embed.setFooter({ text: `${trophies.length} trophy${trophies.length !== 1 ? 'ies' : 'y'} earned • Panindigan` });
    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    await this.handle(target.id, (c) => i.reply(c), i.client);
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    await this.handle(target.id, (c) => m.reply(c), m.client);
  }
}
export default TrophyCommand;

import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class CustomBadgeCommand extends BaseCommand {
  constructor() {
    super({ name: 'custombadge', description: 'Create and equip a custom badge on your profile (Diamond only) 💎', category: 'social', premiumTier: 'diamond', cooldown: 10, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['makebadge', 'createbadge'], examples: ['/custombadge create 🌺 Floral Queen My floral badge', 'p!custombadge create 🔮 Mystic My custom badge'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('create').setDescription('Create a custom badge')
        .addStringOption(o => o.setName('emoji').setDescription('Badge emoji (single emoji only)').setRequired(true).setMaxLength(4))
        .addStringOption(o => o.setName('name').setDescription('Badge name').setRequired(true).setMaxLength(30))
        .addStringOption(o => o.setName('description').setDescription('Badge description').setRequired(false).setMaxLength(100)))
      .addSubcommand(s => s.setName('view').setDescription('View your custom badge'))
      .addSubcommand(s => s.setName('remove').setDescription('Remove your custom badge'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(sub: string, userId: string, emoji: string | null, name: string | null, desc: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    if (sub === 'create') {
      if (!emoji || !name) { await send({ content: '❌ Provide emoji and name for your custom badge.', ephemeral: true }); return; }

      // Basic emoji validation
      const emojiRegex = /\p{Emoji}/u;
      if (!emojiRegex.test(emoji)) { await send({ content: '❌ Please use a valid emoji for your badge.', ephemeral: true }); return; }

      const badgeData = { emoji, name, description: desc || `${name} — custom badge` };

      await prisma.user.upsert({
        where: { userId },
        create: { userId, customBadge: JSON.stringify(badgeData) } as any,
        update: { customBadge: JSON.stringify(badgeData) } as any,
      }).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle('💎 Custom Badge Created!')
        .setDescription(`Your custom badge has been created and equipped on your profile!\n\n${emoji} **${name}**\n> ${desc || `${name} — custom badge`}`)
        .setColor(COLORS.diamond)
        .setFooter({ text: 'Diamond Exclusive • Use /profile to see your badge' })
        .setTimestamp();
      await send({ embeds: [embed] });

    } else if (sub === 'view') {
      const userData = await prisma.user.findUnique({ where: { userId } }).catch(() => null);
      const badgeData = (userData as any)?.customBadge ? JSON.parse((userData as any).customBadge) : null;

      const embed = new EmbedBuilder()
        .setTitle('💎 Custom Badge')
        .setColor(COLORS.diamond)
        .setTimestamp();

      if (badgeData) {
        embed.setDescription(`${badgeData.emoji} **${badgeData.name}**\n> ${badgeData.description}`);
      } else {
        embed.setDescription('You don\'t have a custom badge yet! Use `/custombadge create` to make one.');
      }
      await send({ embeds: [embed] });

    } else if (sub === 'remove') {
      await prisma.user.update({ where: { userId }, data: { customBadge: null } as any }).catch(() => null);
      await send({ content: '✅ Custom badge removed.', ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    await this.handle(sub, i.user.id, i.options.getString('emoji'), i.options.getString('name'), i.options.getString('description'), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() === 'create' || args[0]?.toLowerCase() === 'view' || args[0]?.toLowerCase() === 'remove' ? args[0].toLowerCase() : 'view';
    const emoji = sub === 'create' ? args[1] : null;
    const name = sub === 'create' ? args[2] : null;
    const desc = sub === 'create' ? args.slice(3).join(' ') : null;
    await this.handle(sub, m.author.id, emoji, name, desc, (c) => m.reply(c));
  }
}
export default CustomBadgeCommand;

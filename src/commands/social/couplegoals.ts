// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { coupleProfileService } from '../../features/couple/CoupleProfileService.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class CoupleGoalsCommand extends BaseCommand {
  constructor() {
    super({ name: 'couplegoals', description: 'Set and track couple goals with your partner 🎯', category: 'social', premiumTier: 'gold', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['goals', 'setgoal'], examples: ['/couplegoals set Visit Japan together', '/couplegoals list', 'p!couplegoals set Learn a new language'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('set').setDescription('Add a new couple goal')
        .addStringOption(o => o.setName('goal').setDescription('Your couple goal').setRequired(true).setMaxLength(200)))
      .addSubcommand(s => s.setName('list').setDescription('View all couple goals'))
      .addSubcommand(s => s.setName('complete').setDescription('Mark a goal as completed')
        .addIntegerOption(o => o.setName('number').setDescription('Goal number').setRequired(true).setMinValue(1)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove a goal')
        .addIntegerOption(o => o.setName('number').setDescription('Goal number').setRequired(true).setMinValue(1)))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(sub: string, userId: string, guildId: string, goalText: string | null, goalNum: number | null, send: (c: any) => Promise<any>): Promise<void> {
    const profile = await coupleProfileService.getProfile(userId, guildId);
    if (!profile) { await send({ content: '❌ Wala kang kasalukuyang couple status. Gumamit ng `/marry @user` para mag-propose!', ephemeral: true }); return; }

    const prisma = getPrismaClient();
    const coupleData = await (prisma as any).coupleGoal?.findMany?.({ where: { coupleId: profile.id } }).catch(() => null) || [];

    if (sub === 'set') {
      await (prisma as any).coupleGoal?.create?.({ data: { coupleId: profile.id, goal: goalText, completed: false, createdBy: userId } }).catch(() => null);
      await send({ content: `✅ Couple goal added: **${goalText}**!`, ephemeral: false });

    } else if (sub === 'list') {
      const embed = new EmbedBuilder().setTitle('🎯 Couple Goals').setColor(0xff69b4).setTimestamp();
      if (!coupleData.length) {
        embed.setDescription('No goals set yet! Use `/couplegoals set <goal>` to add one.');
      } else {
        const lines = coupleData.map((g: any, i: number) =>
          `${i + 1}. ${g.completed ? '✅' : '⬜'} ${g.goal}`
        );
        embed.setDescription(lines.join('\n'));
        const done = coupleData.filter((g: any) => g.completed).length;
        embed.setFooter({ text: `${done}/${coupleData.length} goals completed` });
      }
      await send({ embeds: [embed] });

    } else if (sub === 'complete') {
      const goal = coupleData[goalNum! - 1];
      if (!goal) { await send({ content: '❌ Goal not found.', ephemeral: true }); return; }
      await (prisma as any).coupleGoal?.update?.({ where: { id: goal.id }, data: { completed: true } }).catch(() => null);
      await send({ content: `✅ Goal marked as completed: **${goal.goal}**! 🎉`, ephemeral: false });

    } else if (sub === 'remove') {
      const goal = coupleData[goalNum! - 1];
      if (!goal) { await send({ content: '❌ Goal not found.', ephemeral: true }); return; }
      await (prisma as any).coupleGoal?.delete?.({ where: { id: goal.id } }).catch(() => null);
      await send({ content: `🗑️ Goal removed: **${goal.goal}**`, ephemeral: true });
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    await this.handle(sub, i.user.id, i.guildId!, i.options.getString('goal'), i.options.getInteger('number'), (c) => i.reply(c));
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() || 'list';
    const goalText = _args.slice(1).join(' ') || null;
    const goalNum = parseInt(args[1]) || null;
    await this.handle(sub, m.author.id, m.guildId!, goalText, goalNum, (c) => m.reply(c));
  }
}
export default CoupleGoalsCommand;

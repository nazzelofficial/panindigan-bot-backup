import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class PremiumTransferCommand extends BaseCommand {
  constructor() {
    super({ name: 'premium-transfer', description: 'Transfer your premium subscription to another server (Diamond)', category: 'premium', premiumTier: 'diamond', cooldown: 86400, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['transferpremium', 'movepremium'], examples: ['/premium-transfer'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('guild_id').setDescription('Target server ID to transfer premium to').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const targetGuildId = i.options.getString('guild_id', true);
    const prisma = getPrismaClient();
    const premium = await prisma.premium.findFirst({ where: { userId: i.user.id, guildId: i.guildId!, active: true } });
    if (!premium) { await i.reply({ content: '❌ You don\'t have an active premium subscription on this server.', ephemeral: true }); return; }

    const embed = new EmbedBuilder().setTitle('⚠️ Premium Transfer').setColor(COLORS.warning as any)
      .setDescription(`Are you sure you want to transfer your **${premium.tier?.toUpperCase()}** subscription from this server to guild \`${targetGuildId}\`?\n\n⚠️ This action cannot be undone. This server will lose premium.`)
      .setFooter({ text: 'This action has a 24-hour cooldown' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`premium_transfer:${i.guildId!}:${targetGuildId}:${premium.id}`).setLabel('✅ Confirm Transfer').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary),
    );
    await i.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!premium-transfer <guild_id>`'); return; }
    const prisma = getPrismaClient();
    const premium = await prisma.premium.findFirst({ where: { userId: m.author.id, guildId: m.guildId!, active: true } });
    if (!premium) { await m.reply('❌ No active premium on this server.'); return; }
    await m.reply(`⚠️ Premium transfer requires confirmation. Use the slash command \`/premium-transfer\` to proceed safely.`);
  }
}
export default PremiumTransferCommand;

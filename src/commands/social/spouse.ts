// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SpouseCommand extends BaseCommand {
  constructor() {
    super({
      name: 'spouse',
      description: 'See who your partner is 💑',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['partner', 'mywaifu'],
      examples: ['/spouse'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const prisma = getPrismaClient();
      const userId = i.user.id;

      const couple = await prisma.couple.findFirst({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      });

      if (!couple) {
        const embed = new EmbedBuilder()
          .setDescription('💔 You are currently **single**. Maybe try `/couplerequest` to find a partner!')
          .setColor(COLORS.default);
        await i.reply({ embeds: [embed] });
        return;
      }

      const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
      const partner = await i.client.users.fetch(partnerId).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle('💑 Your Partner')
        .setDescription(
          partner
            ? `You are in a relationship with **${partner.username}** (${partner.toString()}) 💕`
            : `You are in a relationship with a user who has left (ID: \`${partnerId}\`) 💕`
        )
        .setThumbnail(partner?.displayAvatarURL() ?? null)
        .setColor(COLORS.default)
        .setFooter({ text: 'Cherish your relationship! 💖' })
        .setTimestamp();

      await i.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[SpouseCommand] Error:', err);
      await i.reply({ content: '❌ Something went wrong while checking your partner status.', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const prisma = getPrismaClient();
      const userId = m.author.id;

      const couple = await prisma.couple.findFirst({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      });

      if (!couple) {
        const embed = new EmbedBuilder()
          .setDescription('💔 You are currently **single**. Maybe try `couplerequest` to find a partner!')
          .setColor(COLORS.default);
        await m.reply({ embeds: [embed] });
        return;
      }

      const partnerId = couple.user1Id === userId ? couple.user2Id : couple.user1Id;
      const partner = await m.client.users.fetch(partnerId).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle('💑 Your Partner')
        .setDescription(
          partner
            ? `You are in a relationship with **${partner.username}** (${partner.toString()}) 💕`
            : `You are in a relationship with a user who has left (ID: \`${partnerId}\`) 💕`
        )
        .setThumbnail(partner?.displayAvatarURL() ?? null)
        .setColor(COLORS.default)
        .setFooter({ text: 'Cherish your relationship! 💖' })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[SpouseCommand] Error:', err);
      await m.reply('❌ Something went wrong while checking your partner status.');
    }
  }
}

export default SpouseCommand;

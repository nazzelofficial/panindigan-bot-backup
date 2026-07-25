import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class BioCommand extends BaseCommand {
  constructor() {
    super({
      name: 'bio',
      description: 'Set or view your personal bio',
      category: 'social',
      premiumTier: 'silver',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setbio', 'viewbio'],
      examples: ['bio set I love Discord!', 'bio view @User'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('set')
          .setDescription('Set your personal bio')
          .addStringOption(o =>
            o.setName('text').setDescription('Your new bio (max 200 characters)').setRequired(true).setMaxLength(200)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('view')
          .setDescription("View a user's bio")
          .addUserOption(o =>
            o.setName('user').setDescription('User to view bio of').setRequired(false)
          )
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    try {
      const sub = i.options.getSubcommand();
      const prisma = getPrismaClient();

      if (sub === 'set') {
        const text = i.options.getString('text', true);

        await (prisma as any).user.upsert({
          where: { discordId: i.user.id },
          update: { bio: text },
          create: { discordId: i.user.id, bio: text },
        });

        const embed = new EmbedBuilder()
          .setColor(COLORS.SUCCESS as any)
          .setTitle('✅ Bio Updated!')
          .setDescription(`Your bio has been set to:\n\n*"${text}"*`)
          .setFooter({ text: 'Panindigan Bot • Bio System' })
          .setTimestamp();

        await i.editReply({ embeds: [embed] });
      } else if (sub === 'view') {
        const target = i.options.getUser('user') ?? i.user;

        const userData = await (prisma as any).user.findUnique({
          where: { discordId: target.id },
          select: { bio: true },
        });

        const bio = userData?.bio ?? '*Walang bio itong user na ito.*';

        const embed = new EmbedBuilder()
          .setColor(COLORS.PRIMARY as any)
          .setTitle(`📖 ${target.username}'s Bio`)
          .setDescription(bio)
          .setThumbnail(target.displayAvatarURL({ size: 128 }))
          .setFooter({ text: 'Panindigan Bot • Bio System' })
          .setTimestamp();

        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('[BioCommand] Error:', error);
      await i.editReply({ content: '❌ May error habang ini-process ang bio. Subukan ulit mamaya.' });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const prisma = getPrismaClient();
      const sub = args[0]?.toLowerCase();

      if (sub === 'set') {
        const text = args.slice(1).join(' ');
        if (!text) {
          await m.reply('❌ Magbigay ng bio text. Example: `bio set I love Discord!`');
          return;
        }
        if (text.length > 200) {
          await m.reply('❌ Ang bio ay hindi pwedeng lumampas sa 200 characters.');
          return;
        }

        await (prisma as any).user.upsert({
          where: { discordId: m.author.id },
          update: { bio: text },
          create: { discordId: m.author.id, bio: text },
        });

        const embed = new EmbedBuilder()
          .setColor(COLORS.SUCCESS as any)
          .setTitle('✅ Bio Updated!')
          .setDescription(`Your bio has been set to:\n\n*"${text}"*`)
          .setFooter({ text: 'Panindigan Bot • Bio System' })
          .setTimestamp();

        await m.reply({ embeds: [embed] });
      } else if (sub === 'view' || !sub) {
        const target = m.mentions.users.first() ?? m.author;

        const userData = await (prisma as any).user.findUnique({
          where: { discordId: target.id },
          select: { bio: true },
        });

        const bio = userData?.bio ?? '*Walang bio itong user na ito.*';

        const embed = new EmbedBuilder()
          .setColor(COLORS.PRIMARY as any)
          .setTitle(`📖 ${target.username}'s Bio`)
          .setDescription(bio)
          .setThumbnail(target.displayAvatarURL({ size: 128 }))
          .setFooter({ text: 'Panindigan Bot • Bio System' })
          .setTimestamp();

        await m.reply({ embeds: [embed] });
      } else {
        await m.reply('❌ Invalid subcommand. Use `bio set <text>` or `bio view [@user]`.');
      }
    } catch (error) {
      console.error('[BioCommand] Error:', error);
      await m.reply('❌ May error habang ini-process ang bio. Subukan ulit mamaya.');
    }
  }
}

export default BioCommand;

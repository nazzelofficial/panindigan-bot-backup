// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';

export class UserBadgeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'userbadge',
      description: 'Add a badge to a user profile (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['addbadge'],
      examples: ['/userbadge 123456789 early_supporter', 'p!userbadge 123456789 early_supporter'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
      .addStringOption(o => o.setName('badge_name').setDescription('Badge name to add').setRequired(true)) as SlashCommandBuilder;
  }

  private async addBadge(userId: string, badgeName: string): Promise<{ badges: string[] }> {
    const mongo = await getMongoClient();
    const db = mongo.db();
    const collection = db.collection('user_profiles');
    const result = await collection.findOneAndUpdate(
      { userId },
      {
        $addToSet: { badges: badgeName },
        $setOnInsert: { userId, createdAt: new Date() },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' },
    );
    return result as any;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.options.getString('user_id', true);
    const badgeName = interaction.options.getString('badge_name', true);
    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await this.addBadge(userId, badgeName);
      const badges: string[] = (result as any)?.badges ?? [badgeName];

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.premium} Badge Added`)
        .setColor(COLORS.success)
        .addFields(
          { name: 'User ID', value: userId, inline: true },
          { name: 'Badge Added', value: `\`${badgeName}\``, inline: true },
          { name: 'All Badges', value: badges.map(b => `\`${b}\``).join(', ') || 'None', inline: false },
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to add badge: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const [userId, badgeName] = _args;
    if (!userId || !badgeName) {
      await message.reply(`${EMOJIS.error} Usage: \`p!userbadge <user_id> <badge_name>\``);
      return;
    }

    try {
      const result = await this.addBadge(userId, badgeName);
      const badges: string[] = (result as any)?.badges ?? [badgeName];

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.premium} Badge Added`)
        .setColor(COLORS.success)
        .addFields(
          { name: 'User ID', value: userId, inline: true },
          { name: 'Badge Added', value: `\`${badgeName}\``, inline: true },
          { name: 'All Badges', value: badges.map(b => `\`${b}\``).join(', ') || 'None', inline: false },
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to add badge: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    }
  }
}

export default UserBadgeCommand;

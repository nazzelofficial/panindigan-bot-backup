import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class UserAliasCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'useralias',
      description: 'Show linked accounts for a user (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['userlinks', 'linkedaccounts'],
      examples: ['/useralias 123456789', 'p!useralias 123456789'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true)) as SlashCommandBuilder;
  }

  private async fetchAliases(userId: string): Promise<any> {
    const mongo = await getMongoClient();
    const db = mongo.db();
    const collection = db.collection('user_aliases');
    return collection.findOne({ userId });
  }

  private buildEmbed(userId: string, data: any): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.social} Linked Accounts — ${userId}`)
      .setColor(COLORS.default)
      .setTimestamp();

    if (!data) {
      embed.setDescription('No linked accounts found for this user.');
      return embed;
    }

    const fields: { name: string; value: string; inline: boolean }[] = [];

    if (data.discord) fields.push({ name: 'Discord ID', value: `\`${data.discord}\``, inline: true });
    if (data.github) fields.push({ name: 'GitHub', value: `\`${data.github}\``, inline: true });
    if (data.twitter) fields.push({ name: 'Twitter', value: `\`${data.twitter}\``, inline: true });
    if (data.twitch) fields.push({ name: 'Twitch', value: `\`${data.twitch}\``, inline: true });
    if (data.youtube) fields.push({ name: 'YouTube', value: `\`${data.youtube}\``, inline: true });
    if (data.steam) fields.push({ name: 'Steam', value: `\`${data.steam}\``, inline: true });

    if (data.aliases && Array.isArray(data.aliases) && data.aliases.length > 0) {
      fields.push({ name: 'Other Aliases', value: data.aliases.map((a: string) => `\`${a}\``).join(', '), inline: false });
    }

    if (fields.length === 0) {
      embed.setDescription('User has no linked accounts configured.');
    } else {
      embed.addFields(fields);
    }

    if (data.linkedAt) {
      embed.setFooter({ text: `Linked: ${new Date(data.linkedAt).toUTCString()}` });
    }

    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.options.getString('user_id', true);
    await interaction.deferReply({ ephemeral: true });

    try {
      const data = await this.fetchAliases(userId);
      const embed = this.buildEmbed(userId, data);
      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to fetch aliases: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const [userId] = args;
    if (!userId) {
      await message.reply(`${EMOJIS.error} Usage: \`p!useralias <user_id>\``);
      return;
    }

    try {
      const data = await this.fetchAliases(userId);
      const embed = this.buildEmbed(userId, data);
      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to fetch aliases: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    }
  }
}

export default UserAliasCommand;

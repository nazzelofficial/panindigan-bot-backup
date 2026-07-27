// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class UserHistoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'userhistory',
      description: 'Show last 10 commands executed by a user (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['userlog', 'cmdhistory'],
      examples: ['/userhistory 123456789', 'p!userhistory 123456789'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true)) as SlashCommandBuilder;
  }

  private async fetchHistory(userId: string): Promise<any[]> {
    const mongo = await getMongoClient();
    const db = mongo.db();
    const collection = db.collection('command_executions');
    const docs = await collection
      .find({ userId })
      .sort({ executedAt: -1 })
      .limit(10)
      .toArray();
    return docs;
  }

  private buildEmbed(userId: string, history: any[]): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Command History — ${userId}`)
      .setColor(COLORS.default)
      .setTimestamp();

    if (history.length === 0) {
      embed.setDescription('No command history found for this user.');
      return embed;
    }

    const lines = history.map((entry, i) => {
      const ts = entry.executedAt ? `<t:${Math.floor(new Date(entry.executedAt).getTime() / 1000)}:R>` : 'Unknown time';
      const guild = entry.guildId ? `Guild: \`${entry.guildId}\`` : 'DM';
      return `**${i + 1}.** \`${entry.commandName ?? 'unknown'}\` — ${ts} | ${guild}`;
    });

    embed.setDescription(lines.join('\n'));
    embed.setFooter({ text: `Showing last ${history.length} commands` });
    return embed;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.options.getString('user_id', true);
    await interaction.deferReply({ ephemeral: true });

    try {
      const history = await this.fetchHistory(userId);
      const embed = this.buildEmbed(userId, history);
      await interaction.editReply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to fetch history: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const [userId] = _args;
    if (!userId) {
      await message.reply(`${EMOJIS.error} Usage: \`p!userhistory <user_id>\``);
      return;
    }

    try {
      const history = await this.fetchHistory(userId);
      const embed = this.buildEmbed(userId, history);
      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`Failed to fetch history: ${error?.message ?? 'Unknown error'}`)
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    }
  }
}

export default UserHistoryCommand;

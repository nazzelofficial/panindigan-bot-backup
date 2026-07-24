import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getCollection } from '../../database/mongodb/client';

export class GiveawayTemplateCommand extends BaseCommand {
  constructor() {
    super({ name: 'gtemplate', description: 'Save and reuse giveaway templates', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-template', 'gw-template'], examples: ['/gtemplate save nitro "Nitro" 1h 1', 'p!gtemplate list'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('save').setDescription('Save a template').addStringOption(o => o.setName('name').setDescription('Template name').setRequired(true)).addStringOption(o => o.setName('prize').setDescription('Prize name').setRequired(true)).addStringOption(o => o.setName('duration').setDescription('Duration').setRequired(true)).addIntegerOption(o => o.setName('winners').setDescription('Winners').setRequired(false)))
      .addSubcommand(s => s.setName('list').setDescription('List saved templates'))
      .addSubcommand(s => s.setName('delete').setDescription('Delete a template').addStringOption(o => o.setName('name').setDescription('Template name').setRequired(true)))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const collection = getCollection('giveaway_templates');

    if (sub === 'save') {
      const name = i.options.getString('name', true);
      const prize = i.options.getString('prize', true);
      const duration = i.options.getString('duration', true);
      const winners = i.options.getInteger('winners') || 1;
      await collection.updateOne({ guildId: i.guildId!, name }, { $set: { guildId: i.guildId!, name, prize, duration, winners, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
      await i.reply({ content: `✅ Template **${name}** saved!`, ephemeral: true });
    } else if (sub === 'list') {
      const templates = await collection.find({ guildId: i.guildId! }).toArray();
      if (!templates.length) { await i.reply({ content: '📭 No templates saved.', ephemeral: true }); return; }
      const embed = new EmbedBuilder().setTitle('📋 Giveaway Templates').setColor(COLORS.gold)
        .setDescription(templates.map((t: any) => `**${t.name}**: ${t.prize} | ${t.duration} | ${t.winners} winner(s)`).join('\n'));
      await i.reply({ embeds: [embed], ephemeral: true });
    } else if (sub === 'delete') {
      const name = i.options.getString('name', true);
      await collection.deleteOne({ guildId: i.guildId!, name });
      await i.reply({ content: `✅ Template **${name}** deleted.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const [sub, name, ...rest] = args;
    const collection = getCollection('giveaway_templates');
    if (sub === 'list') {
      const templates = await collection.find({ guildId: m.guildId! }).toArray();
      if (!templates.length) { await m.reply('📭 No templates.'); return; }
      await m.reply(`📋 **Templates:**\n${templates.map((t: any) => `• **${t.name}**: ${t.prize} | ${t.duration}`).join('\n')}`);
    } else if (sub === 'save' && name) {
      const [prize, duration, wStr] = rest;
      await collection.updateOne({ guildId: m.guildId!, name }, { $set: { guildId: m.guildId!, name, prize: prize || 'Prize', duration: duration || '1h', winners: parseInt(wStr) || 1, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true });
      await m.reply(`✅ Template **${name}** saved!`);
    } else if (sub === 'delete' && name) {
      await collection.deleteOne({ guildId: m.guildId!, name });
      await m.reply(`✅ Template **${name}** deleted.`);
    } else {
      await m.reply('❌ Usage: `p!gtemplate save <name> <prize> <duration> [winners]` or `p!gtemplate list`');
    }
  }
}
export default GiveawayTemplateCommand;

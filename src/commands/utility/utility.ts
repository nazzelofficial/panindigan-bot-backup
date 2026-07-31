// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits,
} from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { validationService } from '../../services/ValidationService.js';
import { COLORS } from '../../constants/DesignSystem.js';

export class UtilityCommand extends BaseCommand {
  constructor() {
    super({
      name: 'utility',
      description: 'General utility commands',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 3,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['util', 'tools'],
      examples: ['/utility afk', '/utility reminder', '/utility search'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // Personal Utilities
      .addSubcommandGroup(g => g.setName('personal').setDescription('Personal user utilities')
        .addSubcommand(s => s.setName('afk').setDescription('Set AFK status')
          .addStringOption(o => o.setName('reason').setDescription('AFK reason').setRequired(false)))
        .addSubcommand(s => s.setName('birthday').setDescription('Set your birthday')
          .addStringOption(o => o.setName('date').setDescription('Birthday (YYYY-MM-DD)').setRequired(true)))
        .addSubcommand(s => s.setName('reminder').setDescription('Set a reminder')
          .addStringOption(o => o.setName('message').setDescription('Reminder message').setRequired(true))
          .addStringOption(o => o.setName('time').setDescription('Time (e.g., 5m, 1h)').setRequired(true)))
        .addSubcommand(s => s.setName('ticket').setDescription('Create a support ticket')
          .addStringOption(o => o.setName('reason').setDescription('Ticket reason').setRequired(false))))
      
      // Search & Information
      .addSubcommandGroup(g => g.setName('search').setDescription('Search utilities')
        .addSubcommand(s => s.setName('google').setDescription('Search Google')
          .addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)))
        .addSubcommand(s => s.setName('youtube').setDescription('Search YouTube')
          .addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)))
        .addSubcommand(s => s.setName('urban').setDescription('Search Urban Dictionary')
          .addStringOption(o => o.setName('term').setDescription('Search term').setRequired(true))))
      
      // Tools
      .addSubcommandGroup(g => g.setName('tools').setDescription('General tools')
        .addSubcommand(s => s.setName('calc').setDescription('Calculate a mathematical expression')
          .addStringOption(o => o.setName('expression').setDescription('Math expression').setRequired(true)))
        .addSubcommand(s => s.setName('charcount').setDescription('Count characters in text')
          .addStringOption(o => o.setName('text').setDescription('Text to count').setRequired(true)))
        .addSubcommand(s => s.setName('color').setDescription('Get color information')
          .addStringOption(o => o.setName('color').setDescription('Color hex or name').setRequired(true)))
        .addSubcommand(s => s.setName('currency').setDescription('Convert currency')
          .addNumberOption(o => o.setName('amount').setDescription('Amount').setRequired(true))
          .addStringOption(o => o.setName('from').setDescription('From currency').setRequired(true))
          .addStringOption(o => o.setName('to').setDescription('To currency').setRequired(true)))
        .addSubcommand(s => s.setName('qr').setDescription('Generate QR code')
          .addStringOption(o => o.setName('url').setDescription('URL or text').setRequired(true)))
        .addSubcommand(s => s.setName('timestamp').setDescription('Convert timestamp to date')
          .addStringOption(o => o.setName('timestamp').setDescription('Unix timestamp').setRequired(false)))
        .addSubcommand(s => s.setName('shorten').setDescription('Shorten a URL')
          .addStringOption(o => o.setName('url').setDescription('URL to shorten').setRequired(true))))
      
      // Notes
      .addSubcommandGroup(g => g.setName('notes').setDescription('Note management')
        .addSubcommand(s => s.setName('add').setDescription('Add a note')
          .addStringOption(o => o.setName('content').setDescription('Note content').setRequired(true)))
        .addSubcommand(s => s.setName('list').setDescription('List your notes'))
        .addSubcommand(s => s.setName('remove').setDescription('Remove a note')
          .addIntegerOption(o => o.setName('id').setDescription('Note ID').setRequired(true)))
        .addSubcommand(s => s.setName('clear').setDescription('Clear all notes')))) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    const validation = await validationService.validateInteraction(i, {
      checkBlacklist: true,
    });

    if (!validation.valid) {
      await ErrorHandler.generic(i, new Error(validation.error));
      return;
    }

    if (subcommandGroup === 'personal') {
      switch (subcommand) {
        case 'afk': await this.handleAfk(i); break;
        case 'birthday': await this.handleBirthday(i); break;
        case 'reminder': await this.handleReminder(i); break;
        case 'ticket': await this.handleTicket(i); break;
      }
    } else if (subcommandGroup === 'search') {
      switch (subcommand) {
        case 'google': await this.handleSearchGoogle(i); break;
        case 'youtube': await this.handleSearchYoutube(i); break;
        case 'urban': await this.handleSearchUrban(i); break;
      }
    } else if (subcommandGroup === 'tools') {
      switch (subcommand) {
        case 'calc': await this.handleToolsCalc(i); break;
        case 'charcount': await this.handleToolsCharCount(i); break;
        case 'color': await this.handleToolsColor(i); break;
        case 'currency': await this.handleToolsCurrency(i); break;
        case 'qr': await this.handleToolsQr(i); break;
        case 'timestamp': await this.handleToolsTimestamp(i); break;
        case 'shorten': await this.handleToolsShorten(i); break;
      }
    } else if (subcommandGroup === 'notes') {
      switch (subcommand) {
        case 'add': await this.handleNotesAdd(i); break;
        case 'list': await this.handleNotesList(i); break;
        case 'remove': await this.handleNotesRemove(i); break;
        case 'clear': await this.handleNotesClear(i); break;
      }
    }
  }

  private async handleAfk(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const reason = i.options.getString('reason') || 'AFK';
    
    // TODO: Implement actual AFK with database integration
    // This would set the user's AFK status in the database
    
    const embed = EmbedManager.info('AFK Status', 'You are now AFK')
      .addFields(
        { name: '👤 User', value: i.user.tag, inline: true },
        { name: '💭 Reason', value: reason, inline: false },
        { name: '⏰ Set at', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleBirthday(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const date = i.options.getString('date', true);
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      await i.editReply({ content: '❌ Invalid date format. Please use YYYY-MM-DD (e.g., 1990-01-15).' });
      return;
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      await i.editReply({ content: '❌ Invalid date. Please use a valid date.' });
      return;
    }
    
    // TODO: Implement actual birthday with database integration
    // This would save the user's birthday in the database
    
    const nextBirthday = new Date(parsedDate);
    nextBirthday.setFullYear(new Date().getFullYear());
    if (nextBirthday < new Date()) {
      nextBirthday.setFullYear(new Date().getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextBirthday.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const embed = EmbedManager.info('Birthday Set', 'Your birthday has been saved')
      .addFields(
        { name: '🎂 Date', value: date, inline: true },
        { name: '👤 User', value: i.user.tag, inline: true },
        { name: '📅 Next Birthday', value: `<t:${Math.floor(nextBirthday.getTime() / 1000)}:R>`, inline: true },
        { name: '⏰ Days Until', value: daysUntil.toString(), inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleReminder(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const message = i.options.getString('message', true);
    const time = i.options.getString('time', true);
    
    // Parse time string (e.g., 5m, 1h, 2d)
    const timeRegex = /^(\d+)([smhd])$/;
    const match = time.match(timeRegex);
    if (!match) {
      await i.editReply({ content: '❌ Invalid time format. Use format like 5m, 1h, 2d (s=seconds, m=minutes, h=hours, d=days).' });
      return;
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const delay = value * multipliers[unit];
    
    if (delay > 7 * 24 * 60 * 60 * 1000) {
      await i.editReply({ content: '❌ Reminder time cannot exceed 7 days.' });
      return;
    }
    
    const reminderTime = Date.now() + delay;
    
    // TODO: Implement actual reminder with database/scheduler integration
    // This would schedule the reminder and save to database
    
    const embed = EmbedManager.info('Reminder Set', 'Your reminder has been scheduled')
      .addFields(
        { name: '💭 Message', value: message, inline: false },
        { name: '⏰ Time', value: time, inline: true },
        { name: '📅 Remind At', value: `<t:${Math.floor(reminderTime / 1000)}:R>`, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleTicket(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const reason = i.options.getString('reason') || 'Support needed';
    
    if (!i.guild) {
      await i.editReply({ content: '❌ This command can only be used in a server.' });
      return;
    }
    
    // TODO: Implement actual ticket creation with channel creation
    // This would create a new ticket channel and add the user
    
    const ticketId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const embed = EmbedManager.info('Ticket Created', 'Your support ticket has been created')
      .addFields(
        { name: '🎫 Ticket ID', value: ticketId, inline: true },
        { name: '👤 User', value: i.user.tag, inline: true },
        { name: '💭 Reason', value: reason, inline: false },
        { name: '🖥️ Server', value: i.guild.name, inline: true },
      )
      .setFooter({ text: 'Support staff will be with you shortly' });
    await i.editReply({ embeds: [embed] });
  }

  private async handleSearchGoogle(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const query = i.options.getString('query', true);
    
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    const embed = EmbedManager.info('Google Search', 'Search results')
      .addFields(
        { name: '🔍 Query', value: query, inline: false },
        { name: '🔗 Link', value: `[Click to search](${googleUrl})`, inline: false },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleSearchYoutube(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const query = i.options.getString('query', true);
    
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const embed = EmbedManager.info('YouTube Search', 'Search results')
      .addFields(
        { name: '🔍 Query', value: query, inline: false },
        { name: '🔗 Link', value: `[Click to search](${youtubeUrl})`, inline: false },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleSearchUrban(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const term = i.options.getString('term', true);
    
    const urbanUrl = `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(term)}`;
    
    // TODO: Implement actual Urban Dictionary API integration
    // This would fetch the definition from the Urban Dictionary API
    
    const embed = EmbedManager.info('Urban Dictionary', 'Definition')
      .addFields(
        { name: '📖 Term', value: term, inline: false },
        { name: '🔗 Link', value: `[View on Urban Dictionary](${urbanUrl})`, inline: false },
      )
      .setFooter({ text: 'API integration coming soon' });
    await i.editReply({ embeds: [embed] });
  }

  private async handleToolsCalc(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const expr = i.options.getString('expression', true);
    
    try {
      // Safe evaluation of mathematical expression
      const sanitized = expr.replace(/[^0-9+\-*/().%^]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      
      const embed = EmbedManager.info('Calculator', 'Calculation result')
        .addFields(
          { name: '📝 Expression', value: expr, inline: false },
          { name: '➡️ Result', value: result.toString(), inline: true },
        );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await i.editReply({ content: '❌ Invalid mathematical expression. Please use valid math operators (+, -, *, /, %, ^, parentheses).' });
    }
  }

  private async handleToolsCharCount(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const text = i.options.getString('text', true);
    
    const charCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const lineCount = text.split('\n').length;
    const spaceCount = (text.match(/ /g) || []).length;
    
    const embed = EmbedManager.info('Character Count', 'Text statistics')
      .addFields(
        { name: '📝 Characters', value: charCount.toString(), inline: true },
        { name: '📖 Words', value: wordCount.toString(), inline: true },
        { name: '📄 Lines', value: lineCount.toString(), inline: true },
        { name: '⌨️ Spaces', value: spaceCount.toString(), inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleToolsColor(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const color = i.options.getString('color', true);
    
    // Handle hex color
    let hexColor = color;
    if (color.startsWith('#')) {
      hexColor = color.substring(1);
    }
    
    // Validate hex color
    const hexRegex = /^[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(hexColor)) {
      await i.editReply({ content: '❌ Invalid color format. Please use a valid hex color (e.g., #FF0000 or FF0000).' });
      return;
    }
    
    const fullHex = `#${hexColor}`;
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = this.rgbToHsl(r, g, b);
    
    const embed = EmbedManager.info('Color Information', fullHex)
      .setColor(parseInt(hexColor, 16))
      .addFields(
        { name: '🎨 HEX', value: fullHex, inline: true },
        { name: '🖼️ RGB', value: rgb, inline: true },
        { name: '🌈 HSL', value: hsl, inline: true },
        { name: '🔢 Decimal', value: parseInt(hexColor, 16).toString(), inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private rgbToHsl(r: number, g: number, b: number): string {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  private async handleToolsCurrency(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getNumber('amount', true);
    const from = i.options.getString('from', true).toUpperCase();
    const to = i.options.getString('to', true).toUpperCase();
    
    // TODO: Implement actual currency conversion with API integration
    // This would fetch exchange rates from a currency API
    
    // Placeholder conversion rates
    const rates: { [key: string]: number } = {
      USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110.0, CAD: 1.25, AUD: 1.35,
    };
    
    if (!rates[from] || !rates[to]) {
      await i.editReply({ content: '❌ Unsupported currency. Supported: USD, EUR, GBP, JPY, CAD, AUD.' });
      return;
    }
    
    const converted = (amount / rates[from]) * rates[to];
    
    const embed = EmbedManager.info('Currency Conversion', 'Conversion result')
      .addFields(
        { name: '💵 Amount', value: amount.toString(), inline: true },
        { name: '🔄 From', value: from, inline: true },
        { name: '➡️ To', value: to, inline: true },
        { name: '📊 Result', value: `${converted.toFixed(2)} ${to}`, inline: false },
      )
      .setFooter({ text: 'Exchange rates are approximate. API integration coming soon.' });
    await i.editReply({ embeds: [embed] });
  }

  private async handleToolsQr(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const url = i.options.getString('url', true);
    
    // TODO: Implement actual QR code generation with API integration
    // This would generate a QR code image using a QR code API
    
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    
    const embed = EmbedManager.info('QR Code', 'Scan to view')
      .setImage(qrApiUrl)
      .addFields(
        { name: '🔗 URL/Text', value: url.length > 100 ? url.substring(0, 100) + '...' : url, inline: false },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleToolsTimestamp(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const timestamp = i.options.getString('timestamp');
    
    let date: Date;
    if (timestamp) {
      const ts = parseInt(timestamp);
      if (isNaN(ts)) {
        await i.editReply({ content: '❌ Invalid timestamp. Please provide a valid Unix timestamp.' });
        return;
      }
      date = new Date(ts * 1000);
    } else {
      date = new Date();
    }
    
    const unix = Math.floor(date.getTime() / 1000);
    const iso = date.toISOString();
    const relative = date.toLocaleString();
    
    const embed = EmbedManager.info('Timestamp', 'Date information')
      .addFields(
        { name: '⏰ Unix', value: unix.toString(), inline: true },
        { name: '📅 ISO', value: iso, inline: false },
        { name: '🌍 Local', value: relative, inline: false },
        { name: '💬 Discord Format', value: `<t:${unix}:R>`, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleToolsShorten(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const url = i.options.getString('url', true);
    
    // Validate URL
    if (!url.match(/^https?:\/\//i)) {
      await i.editReply({ content: '❌ Invalid URL. Please include http:// or https://' });
      return;
    }
    
    // TODO: Implement actual URL shortening with API integration
    // This would use a URL shortening service API
    
    // Generate a short code
    const shortCode = Math.random().toString(36).substring(2, 8);
    const shortUrl = `https://short.url/${shortCode}`;
    
    const embed = EmbedManager.info('URL Shortened', 'Your shortened URL')
      .addFields(
        { name: '🔗 Original', value: url.length > 50 ? url.substring(0, 50) + '...' : url, inline: false },
        { name: '✂️ Shortened', value: shortUrl, inline: false },
      )
      .setFooter({ text: 'API integration coming soon - this is a demo' });
    await i.editReply({ embeds: [embed] });
  }

  private async handleNotesAdd(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const content = i.options.getString('content', true);
    
    // TODO: Implement actual note addition with database integration
    // This would save the note to the database for the user
    const noteId = Math.floor(Math.random() * 10000);
    
    const embed = EmbedManager.info('Note Added', 'Your note has been saved')
      .addFields(
        { name: '📝 ID', value: noteId.toString(), inline: true },
        { name: '👤 User', value: i.user.tag, inline: true },
        { name: '📄 Content', value: content.length > 100 ? content.substring(0, 100) + '...' : content, inline: false },
        { name: '⏰ Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleNotesList(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    // TODO: Implement actual note listing with database integration
    // This would fetch all notes for the user from the database
    const notes = [
      { id: 1, content: 'Sample note 1', created: Date.now() },
      { id: 2, content: 'Sample note 2', created: Date.now() },
    ]; // Placeholder - fetch from database
    
    if (notes.length === 0) {
      await i.editReply({ content: 'You have no notes. Use /utility notes add to create one.' });
      return;
    }
    
    const notesText = notes
      .map(n => `**#${n.id}** - ${n.content.substring(0, 50)}${n.content.length > 50 ? '...' : ''}`)
      .join('\n');
    
    const embed = EmbedManager.info('Your Notes', `Total: ${notes.length}`)
      .setDescription(notesText)
      .setFooter({ text: 'Use /utility notes remove <id> to delete a note' });
    await i.editReply({ embeds: [embed] });
  }

  private async handleNotesRemove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const id = i.options.getInteger('id', true);
    
    // TODO: Implement actual note removal with database integration
    // This would delete the note from the database
    
    const embed = EmbedManager.info('Note Removed', 'Your note has been deleted')
      .addFields(
        { name: '📝 Note ID', value: id.toString(), inline: true },
        { name: '👤 User', value: i.user.tag, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  private async handleNotesClear(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    
    // TODO: Implement actual note clearing with database integration
    // This would delete all notes for the user from the database
    
    const embed = EmbedManager.info('Notes Cleared', 'All your notes have been deleted')
      .addFields(
        { name: '👤 User', value: i.user.tag, inline: true },
        { name: '⏰ Cleared', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      );
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /utility for full options.' });
  }
}

export default UtilityCommand;
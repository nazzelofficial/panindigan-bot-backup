import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, TextChannel, ThreadChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TicketCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ticket',
      description: 'Ticket system: create, close, transcript, claim, or reopen tickets',
      category: 'utility',
      premiumTier: 'silver',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [PermissionFlagsBits.ManageThreads, PermissionFlagsBits.SendMessagesInThreads],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tickets'],
      examples: ['/ticket create', '/ticket close', '/ticket claim', 'p!ticket create'],
    };
    super(options);
  }

  private async handleCreate(username: string, channel: TextChannel, userId: string): Promise<EmbedBuilder> {
    try {
      const thread = await channel.threads.create({
        name: `ticket-${username}`,
        autoArchiveDuration: 1440,
        type: 12 as any, // GUILD_PRIVATE_THREAD
        reason: `Support ticket created by ${username}`,
      });
      await thread.members.add(userId);
      return new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Ticket Created`)
        .setDescription(`Your support ticket has been created: ${thread}`)
        .addFields({ name: 'Thread Name', value: thread.name, inline: true })
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Ticket Creation Failed`)
        .setDescription('Could not create a private thread. Ensure the server has the boost level for private threads.');
    }
  }

  private async handleClose(thread: ThreadChannel): Promise<EmbedBuilder> {
    try {
      await thread.setArchived(true);
      return new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Ticket Closed`)
        .setDescription(`Ticket **${thread.name}** has been closed and archived.`)
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Close Failed`)
        .setDescription('Could not close this ticket thread.');
    }
  }

  private async handleTranscript(thread: ThreadChannel): Promise<EmbedBuilder> {
    try {
      const messages = await thread.messages.fetch({ limit: 100 });
      const sorted = [...messages.values()].reverse();
      const lines = sorted.map(m => `**${m.author.tag}**: ${m.content || '[embed/attachment]'}`);
      const transcript = lines.join('\n').slice(0, 3900);
      return new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle(`📋 Ticket Transcript — ${thread.name}`)
        .setDescription(`\`\`\`${transcript || 'No messages found.'}\`\`\``)
        .addFields({ name: 'Total Messages', value: `${sorted.length}`, inline: true })
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Transcript Failed`)
        .setDescription('Could not fetch messages.');
    }
  }

  private async handleClaim(thread: ThreadChannel, claimerTag: string): Promise<EmbedBuilder> {
    try {
      const newName = `${thread.name} [${claimerTag}]`.slice(0, 100);
      await thread.setName(newName);
      return new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Ticket Claimed`)
        .setDescription(`**${claimerTag}** has claimed this ticket.`)
        .addFields({ name: 'New Thread Name', value: newName, inline: true })
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Claim Failed`)
        .setDescription('Could not rename the thread.');
    }
  }

  private async handleReopen(thread: ThreadChannel): Promise<EmbedBuilder> {
    try {
      await thread.setArchived(false);
      return new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} Ticket Reopened`)
        .setDescription(`Ticket **${thread.name}** has been reopened.`)
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Reopen Failed`)
        .setDescription('Could not reopen this thread.');
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getString('subcommand', true).toLowerCase();
    const channel = interaction.channel;
    await interaction.deferReply();

    let embed: EmbedBuilder;

    if (sub === 'create') {
      if (!channel || !(channel instanceof TextChannel)) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Invalid Channel`).setDescription('Use this in a text channel.');
      } else {
        embed = await this.handleCreate(interaction.user.username, channel, interaction.user.id);
      }
    } else if (sub === 'close') {
      if (!channel?.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleClose(channel as ThreadChannel);
      }
    } else if (sub === 'transcript') {
      if (!channel?.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleTranscript(channel as ThreadChannel);
      }
    } else if (sub === 'claim') {
      if (!channel?.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleClaim(channel as ThreadChannel, interaction.user.tag);
      }
    } else if (sub === 'reopen') {
      if (!channel?.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleReopen(channel as ThreadChannel);
      }
    } else {
      embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Unknown Subcommand`)
        .setDescription('Use: `create`, `close`, `transcript`, `claim`, or `reopen`');
    }

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase();
    if (!sub) {
      const embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Usage`)
        .setDescription('`p!ticket <create|close|transcript|claim|reopen>`');
      await message.reply({ embeds: [embed] });
      return;
    }

    const channel = message.channel;
    let embed: EmbedBuilder;

    if (sub === 'create') {
      if (!(channel instanceof TextChannel)) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Invalid Channel`).setDescription('Use this in a text channel.');
      } else {
        embed = await this.handleCreate(message.author.username, channel, message.author.id);
      }
    } else if (sub === 'close') {
      if (!channel.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleClose(channel as ThreadChannel);
      }
    } else if (sub === 'transcript') {
      if (!channel.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleTranscript(channel as ThreadChannel);
      }
    } else if (sub === 'claim') {
      if (!channel.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleClaim(channel as ThreadChannel, message.author.tag);
      }
    } else if (sub === 'reopen') {
      if (!channel.isThread()) {
        embed = new EmbedBuilder().setColor(COLORS.error).setTitle(`${EMOJIS.error} Not in Thread`).setDescription('Run this inside a ticket thread.');
      } else {
        embed = await this.handleReopen(channel as ThreadChannel);
      }
    } else {
      embed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle(`${EMOJIS.error} Unknown Subcommand`)
        .setDescription('Use: `create`, `close`, `transcript`, `claim`, or `reopen`');
    }

    await message.reply({ embeds: [embed] });
  }
}

export default TicketCommand;

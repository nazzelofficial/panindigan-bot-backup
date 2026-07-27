// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetupCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setup',
      description: 'Run the initial bot setup wizard',
      category: 'admin',
      cooldown: 60,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['configure', 'wizard'],
      examples: ['/setup', 'p!setup'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.runSetup(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.runSetup(message);
  }

  private async runSetup(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Panindigan Setup Wizard`)
      .setDescription('Welcome to the setup wizard! This will help you configure the bot for your server.')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Step 1/5', value: 'Configure basic settings', inline: false },
        { name: 'Current Status', value: guild ? '⚠️ Already configured' : '🆕 Not configured', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_start')
          .setLabel('Start Setup')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('setup_cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger),
      );

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed], components: [row] });
    } else {
      await interaction.reply({ embeds: [embed], components: [row] });
    }

    const collector = (interaction instanceof ChatInputCommandInteraction 
      ? await interaction.fetchReply() 
      : await interaction.channel.messages.fetch(interaction.id)
    ).createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== (interaction.user.id)) {
        await i.reply({ content: '❌ Only the person who started the setup can interact.', ephemeral: true });
        return;
      }

      if (i.customId === 'setup_cancel') {
        await i.update({ content: '❌ Setup cancelled.', components: [], embeds: [] });
        collector.stop();
        return;
      }

      if (i.customId === 'setup_start') {
        await i.update({ content: '⏳ Starting setup...', components: [], embeds: [] });
        
        await this.setupPrefix(interaction);
      }
    });
  }

  private async setupPrefix(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = getPrismaClient();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Step 1/5: Prefix`)
      .setDescription('What prefix would you like to use for the bot?')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Current', value: 'p!', inline: true },
        { name: 'Example', value: 'Use ! or - or any character', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup_prefix')
          .setPlaceholder('Select a prefix')
          .addOptions([
            { label: 'p!', value: 'p!', description: 'Default prefix' },
            { label: '!', value: '!', description: 'Simple prefix' },
            { label: '-', value: '-', description: 'Hyphen prefix' },
            { label: '.', value: '.', description: 'Dot prefix' },
            { label: 'Custom', value: 'custom', description: 'Type your own' },
          ]),
      );

    const message = await (interaction instanceof ChatInputCommandInteraction
      ? interaction.followUp({ embeds: [embed], components: [row], fetchReply: true })
      : interaction.channel.send({ embeds: [embed], components: [row] })
    );

    const collector = (message as any).createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const prefix = i.values[0];
      await i.update({ content: `✅ Prefix set to: \`${prefix}\``, components: [], embeds: [] });

      await prisma.guild.upsert({
        where: { guildId: interaction.guild!.id },
        update: { prefix },
        create: { guildId: interaction.guild!.id, prefix },
      });

      collector.stop();
      await this.setupLanguage(interaction);
    });
  }

  private async setupLanguage(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const prisma = getPrismaClient();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Step 2/5: Language`)
      .setDescription('What language should the bot use?')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Supported Languages', value: 'English, Filipino (Tagalog)', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup_language')
          .setPlaceholder('Select a language')
          .addOptions([
            { label: 'English', value: 'en', description: 'English language' },
            { label: 'Filipino', value: 'fil', description: 'Filipino (Tagalog) language' },
          ]),
      );

    const message = await (interaction instanceof ChatInputCommandInteraction
      ? interaction.followUp({ embeds: [embed], components: [row], fetchReply: true })
      : interaction.channel.send({ embeds: [embed], components: [row] })
    );

    const collector = (message as any).createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const language = i.values[0];
      await i.update({ content: `✅ Language set to: \`${language}\``, components: [], embeds: [] });

      await prisma.guild.update({
        where: { guildId: interaction.guild!.id },
        data: { language },
      });

      collector.stop();
      await this.setupWelcome(interaction);
    });
  }

  private async setupWelcome(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Step 3/5: Welcome Channel`)
      .setDescription('Which channel should welcome messages be sent to?')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Note', value: 'You can configure this later with /welcome', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup_welcome')
          .setPlaceholder('Select a channel')
          .addOptions(
            interaction.guild.channels.cache
              .filter(c => c.isTextBased())
              .map(c => ({ label: c.name, value: c.id, description: `Channel: ${c.name}` }))
              .slice(0, 25)
          ),
      );

    const message = await (interaction instanceof ChatInputCommandInteraction
      ? interaction.followUp({ embeds: [embed], components: [row], fetchReply: true })
      : interaction.channel.send({ embeds: [embed], components: [row] })
    );

    const collector = (message as any).createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const channelId = i.values[0];
      const channel = interaction.guild!.channels.cache.get(channelId);
      await i.update({ content: `✅ Welcome channel set to: ${channel}`, components: [], embeds: [] });

      const prisma = getPrismaClient();
      await prisma.guild.update({
        where: { guildId: interaction.guild!.id },
        data: { welcomeChannelId: channelId },
      });

      collector.stop();
      await this.setupAutoRole(interaction);
    });
  }

  private async setupAutoRole(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.settings} Step 4/5: Auto Role`)
      .setDescription('Which role should be given to new members?')
      .setColor(COLORS.info)
      .addFields([
        { name: 'Note', value: 'You can configure this later with /autorole', inline: true },
      ])
      .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup_autorole')
          .setPlaceholder('Select a role')
          .addOptions([
            { label: 'None', value: 'none', description: 'No auto role' },
            ...interaction.guild.roles.cache
              .filter(r => r.name !== '@everyone')
              .map(r => ({ label: r.name, value: r.id, description: `Role: ${r.name}` }))
              .slice(0, 24)
          ]),
      );

    const message = await (interaction instanceof ChatInputCommandInteraction
      ? interaction.followUp({ embeds: [embed], components: [row], fetchReply: true })
      : interaction.channel.send({ embeds: [embed], components: [row] })
    );

    const collector = (message as any).createMessageComponentCollector({ time: 300000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) return;

      const roleId = i.values[0];
      const prisma = getPrismaClient();

      if (roleId === 'none') {
        await i.update({ content: '✅ Auto role disabled', components: [], embeds: [] });
        await prisma.guild.update({
          where: { guildId: interaction.guild!.id },
          data: { autoRoleId: null },
        });
      } else {
        const role = interaction.guild!.roles.cache.get(roleId);
        await i.update({ content: `✅ Auto role set to: ${role}`, components: [], embeds: [] });
        await prisma.guild.update({
          where: { guildId: interaction.guild!.id },
          data: { autoRoleId: roleId },
        });
      }

      collector.stop();
      await this.setupComplete(interaction);
    });
  }

  private async setupComplete(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Setup Complete!`)
      .setDescription('Your bot has been configured successfully.')
      .setColor(COLORS.success)
      .addFields([
        { name: 'Next Steps', value: '• Use /config to change settings\n• Use /help to see all commands\n• Check out our support server for help', inline: false },
      ])
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.followUp({ embeds: [embed] });
    } else {
      await interaction.channel.send({ embeds: [embed] });
    }
  }
}

export default SetupCommand;

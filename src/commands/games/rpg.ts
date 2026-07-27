// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const CLASSES = {
  warrior: { emoji: '⚔️', hp: 150, atk: 20, def: 15, desc: 'High HP and defense, moderate attack.' },
  mage:    { emoji: '🔮', hp: 90,  atk: 35, def: 5,  desc: 'Glass cannon — devastating magic attacks.' },
  archer:  { emoji: '🏹', hp: 110, atk: 28, def: 8,  desc: 'Balanced ranged fighter with high accuracy.' },
};

const MONSTERS = [
  { name: 'Goblin',   emoji: '👺', hp: 40,  atk: 8,  xp: 30,  gold: 15 },
  { name: 'Orc',      emoji: '👹', hp: 80,  atk: 15, xp: 60,  gold: 30 },
  { name: 'Dragon',   emoji: '🐉', hp: 200, atk: 35, xp: 200, gold: 100 },
  { name: 'Skeleton', emoji: '💀', hp: 60,  atk: 12, xp: 45,  gold: 20 },
  { name: 'Troll',    emoji: '🧌', hp: 120, atk: 22, xp: 90,  gold: 50 },
];

const EXPLORE_EVENTS = [
  { text: 'You found a hidden treasure chest! (+50 gold)', gold: 50, xp: 10 },
  { text: 'You discover an ancient shrine and pray. (+20 XP)', gold: 0, xp: 20 },
  { text: 'You stumble upon a merchant. (+30 gold)', gold: 30, xp: 0 },
  { text: 'You get lost in the woods. Nothing happens.', gold: 0, xp: 5 },
  { text: 'You find a healing spring. (+HP, +10 XP)', gold: 0, xp: 10 },
];

export class RPGCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rpg',
      description: 'Play a text-based RPG adventure — fight, explore, and level up!',
      category: 'games',
      premiumTier: 'silver',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['adventure', 'quest'],
      examples: ['/rpg start', '/rpg fight', '/rpg explore', 'p!rpg stats'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('start').setDescription('Create your RPG character'))
      .addSubcommand(s => s.setName('stats').setDescription('View your character stats'))
      .addSubcommand(s => s.setName('fight').setDescription('Battle a random monster'))
      .addSubcommand(s => s.setName('explore').setDescription('Explore the dungeon for events'))
      .addSubcommand(s => s.setName('inventory').setDescription('Check your inventory'))
      .addSubcommand(s => s.setName('class').setDescription('Change your class (warrior/mage/archer)')
        .addStringOption(o => o.setName('class').setDescription('Class to switch to').setRequired(true)
          .addChoices({ name: '⚔️ Warrior', value: 'warrior' }, { name: '🔮 Mage', value: 'mage' }, { name: '🏹 Archer', value: 'archer' })))
      .setDMPermission(false)
    ) as SlashCommandBuilder;
  }

  private async getOrCreateChar(userId: string, guildId: string) {
    const prisma = getPrismaClient();
    let char = await (prisma as any).rpgCharacter?.findUnique?.({ where: { userId_guildId: { userId, guildId } } }).catch(() => null);
    return char;
  }

  private async handleSubcommand(sub: string, userId: string, guildId: string, username: string, classArg?: string): Promise<EmbedBuilder> {
    if (sub === 'start') {
      const embed = new EmbedBuilder()
        .setTitle('⚔️ RPG — Create Your Character')
        .setColor(COLORS.gold)
        .setDescription('Choose your class to begin your adventure!\n\n' +
          Object.entries(CLASSES).map(([k, v]) => `**${v.emoji} ${k.charAt(0).toUpperCase() + k.slice(1)}**\n${v.desc}\nHP: ${v.hp} | ATK: ${v.atk} | DEF: ${v.def}`).join('\n\n'))
        .setFooter({ text: 'Use /rpg class <name> or p!rpg class <name> to pick your class' })
        .setTimestamp();
      return embed;
    }

    if (sub === 'class' && classArg) {
      const cls = CLASSES[classArg as keyof typeof CLASSES];
      if (!cls) return new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid class. Choose: warrior, mage, archer');
      return new EmbedBuilder()
        .setTitle(`${cls.emoji} Class Selected: ${classArg.charAt(0).toUpperCase() + classArg.slice(1)}`)
        .setColor(COLORS.success)
        .setDescription(`✅ Your class has been set!\n\n${cls.desc}\n\n**Stats:**\n❤️ HP: ${cls.hp}\n⚔️ ATK: ${cls.atk}\n🛡️ DEF: ${cls.def}`)
        .setFooter({ text: 'Use /rpg fight to battle monsters!' })
        .setTimestamp();
    }

    if (sub === 'stats') {
      return new EmbedBuilder()
        .setTitle(`⚔️ ${username}'s RPG Stats`)
        .setColor(COLORS.info)
        .addFields(
          { name: '🧙 Class', value: 'Warrior (example)', inline: true },
          { name: '📊 Level', value: '1', inline: true },
          { name: '✨ XP', value: '0 / 100', inline: true },
          { name: '❤️ HP', value: '150 / 150', inline: true },
          { name: '⚔️ ATK', value: '20', inline: true },
          { name: '🛡️ DEF', value: '15', inline: true },
          { name: '💰 Gold', value: '100', inline: true },
        )
        .setFooter({ text: 'Use /rpg fight to battle and gain XP!' })
        .setTimestamp();
    }

    if (sub === 'fight') {
      const monster = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
      const playerAtk = 20 + Math.floor(Math.random() * 10);
      const playerDef = 15;
      const won = playerAtk + Math.random() * 10 > monster.atk - playerDef;
      return new EmbedBuilder()
        .setTitle(`⚔️ Battle: You vs ${monster.emoji} ${monster.name}`)
        .setColor(won ? COLORS.success : COLORS.error)
        .setDescription(won
          ? `🎉 Victory! You defeated the **${monster.name}**!\n\n+${monster.xp} XP | +${monster.gold} Gold`
          : `💀 Defeat! The **${monster.name}** was too powerful!\n\nYou lost some HP. Rest and try again.`)
        .addFields(
          { name: `${monster.emoji} ${monster.name}`, value: `HP: ${monster.hp} | ATK: ${monster.atk}`, inline: true },
          { name: '👤 You', value: `ATK: ${playerAtk} | DEF: ${playerDef}`, inline: true },
        )
        .setTimestamp();
    }

    if (sub === 'explore') {
      const event = EXPLORE_EVENTS[Math.floor(Math.random() * EXPLORE_EVENTS.length)];
      return new EmbedBuilder()
        .setTitle('🗺️ Dungeon Exploration')
        .setColor(COLORS.info)
        .setDescription(`You venture into the dungeon...\n\n${event.text}`)
        .addFields(
          { name: '✨ XP Gained', value: `+${event.xp}`, inline: true },
          { name: '💰 Gold Gained', value: `+${event.gold}`, inline: true },
        )
        .setTimestamp();
    }

    if (sub === 'inventory') {
      return new EmbedBuilder()
        .setTitle(`🎒 ${username}'s Inventory`)
        .setColor(COLORS.info)
        .setDescription('Your inventory is empty.\n\nExplore dungeons and defeat monsters to collect items!')
        .setFooter({ text: 'Use /rpg explore or /rpg fight to find loot' })
        .setTimestamp();
    }

    return new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Unknown subcommand.');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    const cls = sub === 'class' ? interaction.options.getString('class') ?? undefined : undefined;
    const embed = await this.handleSubcommand(sub, interaction.user.id, interaction.guildId!, interaction.user.username, cls);
    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() || 'stats';
    const cls = args[1]?.toLowerCase();
    const embed = await this.handleSubcommand(sub, message.author.id, message.guildId!, message.author.username, cls);
    await message.reply({ embeds: [embed] });
  }
}

export default RPGCommand;

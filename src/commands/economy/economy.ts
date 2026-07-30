// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { validationService } from '../../services/ValidationService.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { emojiManager } from '../../utils/EmojiManager.js';

export class EconomyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'economy',
      description: 'Economy commands for virtual currency and trading',
      category: 'economy',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['eco', 'money', 'cash'],
      examples: ['/economy balance', '/economy daily', '/economy shop'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // Currency Subcommand Group
      .addSubcommandGroup(g => g.setName('currency').setDescription('Currency management')
        .addSubcommand(s => s.setName('balance').setDescription('Check your balance')
          .addUserOption(o => o.setName('user').setDescription('User to check balance for').setRequired(false)))
        .addSubcommand(s => s.setName('wallet').setDescription('Check your wallet balance')
          .addUserOption(o => o.setName('user').setDescription('User to check wallet for').setRequired(false)))
        .addSubcommand(s => s.setName('bank').setDescription('Check your bank balance')
          .addUserOption(o => o.setName('user').setDescription('User to check bank for').setRequired(false)))
        .addSubcommand(s => s.setName('deposit').setDescription('Deposit coins to bank')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to deposit').setRequired(true).setMinValue(1)))
        .addSubcommand(s => s.setName('withdraw').setDescription('Withdraw coins from bank')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to withdraw').setRequired(true).setMinValue(1)))
        .addSubcommand(s => s.setName('transfer').setDescription('Transfer coins to another user')
          .addUserOption(o => o.setName('user').setDescription('User to transfer to').setRequired(true))
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to transfer').setRequired(true).setMinValue(1))))
      
      // Income Subcommand Group
      .addSubcommandGroup(g => g.setName('income').setDescription('Income sources')
        .addSubcommand(s => s.setName('daily').setDescription('Claim daily reward'))
        .addSubcommand(s => s.setName('weekly').setDescription('Claim weekly reward'))
        .addSubcommand(s => s.setName('monthly').setDescription('Claim monthly reward'))
        .addSubcommand(s => s.setName('work').setDescription('Work for coins'))
        .addSubcommand(s => s.setName('beg').setDescription('Beg for coins'))
        .addSubcommand(s => s.setName('crime').setDescription('Attempt a crime for coins'))
        .addSubcommand(s => s.setName('invest').setDescription('Invest coins')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to invest').setRequired(true).setMinValue(1))))
      
      // Shop Subcommand Group
      .addSubcommandGroup(g => g.setName('shop').setDescription('Shop management')
        .addSubcommand(s => s.setName('view').setDescription('View the shop'))
        .addSubcommand(s => s.setName('buy').setDescription('Buy an item')
          .addStringOption(o => o.setName('item').setDescription('Item name').setRequired(true))
          .addIntegerOption(o => o.setName('quantity').setDescription('Quantity').setRequired(false).setMinValue(1).setMaxValue(10)))
        .addSubcommand(s => s.setName('sell').setDescription('Sell an item')
          .addStringOption(o => o.setName('item').setDescription('Item name').setRequired(true))
          .addIntegerOption(o => o.setName('quantity').setDescription('Quantity').setRequired(false).setMinValue(1).setMaxValue(10)))
        .addSubcommand(s => s.setName('inventory').setDescription('View your inventory')
          .addUserOption(o => o.setName('user').setDescription('User to view inventory for').setRequired(false))))
      
      // Gambling Subcommand Group
      .addSubcommandGroup(g => g.setName('gambling').setDescription('Gambling games')
        .addSubcommand(s => s.setName('coinflip').setDescription('Flip a coin')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
          .addStringOption(o => o.setName('side').setDescription('Heads or tails').setRequired(true)
            .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' })))
        .addSubcommand(s => s.setName('dice').setDescription('Roll dice')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
          .addIntegerOption(o => o.setName('guess').setDescription('Your guess (1-6)').setRequired(true).setMinValue(1).setMaxValue(6)))
        .addSubcommand(s => s.setName('slots').setDescription('Play slots')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)))
        .addSubcommand(s => s.setName('blackjack').setDescription('Play blackjack')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1)))
        .addSubcommand(s => s.setName('roulette').setDescription('Play roulette')
          .addIntegerOption(o => o.setName('amount').setDescription('Amount to bet').setRequired(true).setMinValue(1))
          .addStringOption(o => o.setName('bet').setDescription('Bet type').setRequired(true)
            .addChoices({ name: 'Red', value: 'red' }, { name: 'Black', value: 'black' }, { name: 'Green', value: 'green' }))))
      
      // Business Subcommand Group
      .addSubcommandGroup(g => g.setName('business').setDescription('Business management')
        .addSubcommand(s => s.setName('start').setDescription('Start a business')
          .addStringOption(o => o.setName('name').setDescription('Business name').setRequired(true))
          .addStringOption(o => o.setName('type').setDescription('Business type').setRequired(true)
            .addChoices({ name: 'Restaurant', value: 'restaurant' }, { name: 'Tech', value: 'tech' }, { name: 'Retail', value: 'retail' })))
        .addSubcommand(s => s.setName('upgrade').setDescription('Upgrade your business'))
        .addSubcommand(s => s.setName('sell').setDescription('Sell your business'))
        .addSubcommand(s => s.setName('info').setDescription('View business info')
          .addUserOption(o => o.setName('user').setDescription('User to view business for').setRequired(false))))
      
      // Leaderboard Subcommand
      .addSubcommand(s => s.setName('leaderboard').setDescription('View economy leaderboard')
        .addStringOption(o => o.setName('type').setDescription('Leaderboard type').setRequired(false)
          .addChoices({ name: 'Balance', value: 'balance' }, { name: 'Net Worth', value: 'networth' })))
      
      // Profile Subcommand
      .addSubcommand(s => s.setName('profile').setDescription('View your economy profile')
        .addUserOption(o => o.setName('user').setDescription('User to view profile for').setRequired(false)))
      
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    const validation = await validationService.validateInteraction(i, {
      requireGuild: true,
      checkBlacklist: true,
    });

    if (!validation.valid) {
      await ErrorHandler.generic(i, new Error(validation.error));
      return;
    }

    if (subcommandGroup === 'currency') {
      switch (subcommand) {
        case 'balance': await this.handleBalance(i); break;
        case 'wallet': await this.handleWallet(i); break;
        case 'bank': await this.handleBank(i); break;
        case 'deposit': await this.handleDeposit(i); break;
        case 'withdraw': await this.handleWithdraw(i); break;
        case 'transfer': await this.handleTransfer(i); break;
      }
    } else if (subcommandGroup === 'income') {
      switch (subcommand) {
        case 'daily': await this.handleDaily(i); break;
        case 'weekly': await this.handleWeekly(i); break;
        case 'monthly': await this.handleMonthly(i); break;
        case 'work': await this.handleWork(i); break;
        case 'beg': await this.handleBeg(i); break;
        case 'crime': await this.handleCrime(i); break;
        case 'invest': await this.handleInvest(i); break;
      }
    } else if (subcommandGroup === 'shop') {
      switch (subcommand) {
        case 'view': await this.handleShopView(i); break;
        case 'buy': await this.handleShopBuy(i); break;
        case 'sell': await this.handleShopSell(i); break;
        case 'inventory': await this.handleInventory(i); break;
      }
    } else if (subcommandGroup === 'gambling') {
      switch (subcommand) {
        case 'coinflip': await this.handleCoinflip(i); break;
        case 'dice': await this.handleDice(i); break;
        case 'slots': await this.handleSlots(i); break;
        case 'blackjack': await this.handleBlackjack(i); break;
        case 'roulette': await this.handleRoulette(i); break;
      }
    } else if (subcommandGroup === 'business') {
      switch (subcommand) {
        case 'start': await this.handleBusinessStart(i); break;
        case 'upgrade': await this.handleBusinessUpgrade(i); break;
        case 'sell': await this.handleBusinessSell(i); break;
        case 'info': await this.handleBusinessInfo(i); break;
      }
    } else {
      switch (subcommand) {
        case 'leaderboard': await this.handleLeaderboard(i); break;
        case 'profile': await this.handleProfile(i); break;
      }
    }
  }

  // Currency Handlers
  private async handleBalance(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: user.id },
      });

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const total = wallet + bank;

      const embed = EmbedManager.economy('Balance', `${user.tag}'s balance`, {
        fields: [
          { name: '💰 Wallet', value: `${wallet.toLocaleString()} coins`, inline: true },
          { name: '🏦 Bank', value: `${bank.toLocaleString()} coins`, inline: true },
          { name: '💎 Total', value: `${total.toLocaleString()} coins`, inline: true },
        ],
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWallet(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: user.id },
      });

      const wallet = economy?.wallet || 0;

      const embed = EmbedManager.economy('Wallet', `${user.tag}'s wallet`, {
        fields: [{ name: '💰 Balance', value: `${wallet.toLocaleString()} coins`, inline: true }],
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBank(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: user.id },
      });

      const bank = economy?.bank || 0;

      const embed = EmbedManager.economy('Bank', `${user.tag}'s bank`, {
        fields: [{ name: '🏦 Balance', value: `${bank.toLocaleString()} coins`, inline: true }],
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDeposit(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const economy = validation.data.economy;
      if (economy.wallet < amount) {
        await ErrorHandler.generic(i, new Error('Insufficient wallet balance'));
        return;
      }

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { decrement: amount }, bank: { increment: amount } },
      });

      const embed = EmbedManager.economy('Deposit', `Deposited ${amount.toLocaleString()} coins to bank`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWithdraw(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: i.user.id },
      });

      if (!economy || economy.bank < amount) {
        await ErrorHandler.generic(i, new Error('Insufficient bank balance'));
        return;
      }

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { bank: { decrement: amount }, wallet: { increment: amount } },
      });

      const embed = EmbedManager.economy('Withdraw', `Withdrew ${amount.toLocaleString()} coins from bank`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleTransfer(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user', true);
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const economy = validation.data.economy;
      if (economy.wallet < amount) {
        await ErrorHandler.generic(i, new Error('Insufficient wallet balance'));
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { decrement: amount } },
        }),
        prisma.economy.upsert({
          where: { userId: user.id },
          create: { userId: user.id, wallet: amount, bank: 0 },
          update: { wallet: { increment: amount } },
        }),
      ]);

      const embed = EmbedManager.economy('Transfer', `Transferred ${amount.toLocaleString()} coins to ${user.tag}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Income Handlers
  private async handleDaily(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: i.user.id },
      });

      if (!economy) {
        await prisma.economy.create({
          data: { userId: i.user.id, wallet: 500, bank: 0, lastDaily: new Date() },
        });
      } else {
        const lastDaily = economy.lastDaily ? new Date(economy.lastDaily) : new Date(0);
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours

        if (Date.now() - lastDaily.getTime() < cooldown) {
          const remaining = Math.ceil((cooldown - (Date.now() - lastDaily.getTime())) / 1000 / 60 / 60);
          await ErrorHandler.generic(i, new Error(`You can claim daily again in ${remaining} hours`));
          return;
        }

        await prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { increment: 500 }, lastDaily: new Date() },
        });
      }

      const embed = EmbedManager.economy('Daily Reward', 'You claimed 500 coins!', { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWeekly(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: i.user.id },
      });

      if (!economy) {
        await prisma.economy.create({
          data: { userId: i.user.id, wallet: 3000, bank: 0, lastWeekly: new Date() },
        });
      } else {
        const lastWeekly = economy.lastWeekly ? new Date(economy.lastWeekly) : new Date(0);
        const cooldown = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (Date.now() - lastWeekly.getTime() < cooldown) {
          const remaining = Math.ceil((cooldown - (Date.now() - lastWeekly.getTime())) / 1000 / 60 / 60 / 24);
          await ErrorHandler.generic(i, new Error(`You can claim weekly again in ${remaining} days`));
          return;
        }

        await prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { increment: 3000 }, lastWeekly: new Date() },
        });
      }

      const embed = EmbedManager.economy('Weekly Reward', 'You claimed 3,000 coins!', { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMonthly(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: i.user.id },
      });

      if (!economy) {
        await prisma.economy.create({
          data: { userId: i.user.id, wallet: 10000, bank: 0, lastMonthly: new Date() },
        });
      } else {
        const lastMonthly = economy.lastMonthly ? new Date(economy.lastMonthly) : new Date(0);
        const cooldown = 30 * 24 * 60 * 60 * 1000; // 30 days

        if (Date.now() - lastMonthly.getTime() < cooldown) {
          const remaining = Math.ceil((cooldown - (Date.now() - lastMonthly.getTime())) / 1000 / 60 / 60 / 24);
          await ErrorHandler.generic(i, new Error(`You can claim monthly again in ${remaining} days`));
          return;
        }

        await prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { increment: 10000 }, lastMonthly: new Date() },
        });
      }

      const embed = EmbedManager.economy('Monthly Reward', 'You claimed 10,000 coins!', { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWork(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const earnings = Math.floor(Math.random() * 200) + 50;

      await prisma.economy.upsert({
        where: { userId: i.user.id },
        create: { userId: i.user.id, wallet: earnings, bank: 0 },
        update: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Work', `You worked hard and earned ${earnings} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBeg(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const success = Math.random() > 0.5;
      const earnings = success ? Math.floor(Math.random() * 50) + 10 : 0;

      await prisma.economy.upsert({
        where: { userId: i.user.id },
        create: { userId: i.user.id, wallet: earnings, bank: 0 },
        update: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Beg', success ? `Someone gave you ${earnings} coins!` : 'No one gave you anything...', { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleCrime(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const success = Math.random() > 0.7;
      const earnings = success ? Math.floor(Math.random() * 500) + 100 : -Math.floor(Math.random() * 100);

      await prisma.economy.upsert({
        where: { userId: i.user.id },
        create: { userId: i.user.id, wallet: Math.max(0, earnings), bank: 0 },
        update: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Crime', success ? `You successfully stole ${earnings} coins!` : `You got caught and lost ${Math.abs(earnings)} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleInvest(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const economy = validation.data.economy;
      if (economy.wallet < amount) {
        await ErrorHandler.generic(i, new Error('Insufficient wallet balance'));
        return;
      }

      const multiplier = Math.random() > 0.5 ? (Math.random() * 0.5 + 1) : (Math.random() * 0.5 + 0.5);
      const returns = Math.floor(amount * multiplier);

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: returns - amount } },
      });

      const embed = EmbedManager.economy('Invest', `Your investment returned ${returns.toLocaleString()} coins (${(multiplier * 100).toFixed(1)}%)`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Shop Handlers
  private async handleShopView(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const items = await prisma.shopItem.findMany();

      const embed = EmbedManager.economy('Shop', 'Available items', {
        fields: items.map(item => ({
          name: `${item.name} - ${item.price.toLocaleString()} coins`,
          value: item.description || 'No description',
          inline: false,
        })),
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleShopBuy(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const itemName = i.options.getString('item', true);
    const quantity = i.options.getInteger('quantity') || 1;
    const prisma = getPrismaClient();

    try {
      const item = await prisma.shopItem.findFirst({
        where: { name: itemName },
      });

      if (!item) {
        await ErrorHandler.generic(i, new Error('Item not found'));
        return;
      }

      const totalCost = item.price * quantity;
      const validation = await validationService.validateEconomyTransaction(i, totalCost);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { decrement: totalCost } },
        }),
        prisma.inventory.upsert({
          where: { userId_itemId: { userId: i.user.id, itemId: item.id } },
          create: { userId: i.user.id, itemId: item.id, quantity },
          update: { quantity: { increment: quantity } },
        }),
      ]);

      const embed = EmbedManager.economy('Purchase', `Bought ${quantity}x ${item.name} for ${totalCost.toLocaleString()} coins`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleShopSell(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const itemName = i.options.getString('item', true);
    const quantity = i.options.getInteger('quantity') || 1;
    const prisma = getPrismaClient();

    try {
      const item = await prisma.shopItem.findFirst({
        where: { name: itemName },
      });

      if (!item) {
        await ErrorHandler.generic(i, new Error('Item not found'));
        return;
      }

      const inventory = await prisma.inventory.findUnique({
        where: { userId_itemId: { userId: i.user.id, itemId: item.id } },
      });

      if (!inventory || inventory.quantity < quantity) {
        await ErrorHandler.generic(i, new Error('Insufficient item quantity'));
        return;
      }

      const sellPrice = Math.floor(item.price * 0.5);
      const totalEarnings = sellPrice * quantity;

      await prisma.$transaction([
        prisma.inventory.update({
          where: { userId_itemId: { userId: i.user.id, itemId: item.id } },
          data: { quantity: { decrement: quantity } },
        }),
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { increment: totalEarnings } },
        }),
      ]);

      const embed = EmbedManager.economy('Sell', `Sold ${quantity}x ${item.name} for ${totalEarnings.toLocaleString()} coins`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleInventory(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const inventory = await prisma.inventory.findMany({
        where: { userId: user.id },
        include: { item: true },
      });

      const embed = EmbedManager.economy('Inventory', `${user.tag}'s inventory`, {
        fields: inventory.map(inv => ({
          name: `${inv.item.name} x${inv.quantity}`,
          value: inv.item.description || 'No description',
          inline: false,
        })),
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Gambling Handlers (simplified - full implementation would be more complex)
  private async handleCoinflip(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const side = i.options.getString('side', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const result = Math.random() > 0.5 ? 'heads' : 'tails';
      const won = result === side;
      const earnings = won ? amount * 2 : -amount;

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Coinflip', `Result: ${result.toUpperCase()}. You ${won ? 'won' : 'lost'} ${Math.abs(earnings).toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDice(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const guess = i.options.getInteger('guess', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const result = Math.floor(Math.random() * 6) + 1;
      const won = result === guess;
      const earnings = won ? amount * 5 : -amount;

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Dice', `Result: ${result}. Your guess: ${guess}. You ${won ? 'won' : 'lost'} ${Math.abs(earnings).toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSlots(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
      const result = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
      
      let multiplier = 0;
      if (result[0] === result[1] && result[1] === result[2]) {
        multiplier = result[0] === '7️⃣' ? 10 : result[0] === '💎' ? 5 : 3;
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        multiplier = 1.5;
      }

      const earnings = Math.floor(amount * multiplier) - amount;

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Slots', `${result.join(' ')} - ${multiplier > 0 ? `Won ${Math.floor(amount * multiplier).toLocaleString()} coins!` : 'Lost'}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBlackjack(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      // Simplified blackjack - full implementation would be more complex
      const playerTotal = Math.floor(Math.random() * 10) + 12;
      const dealerTotal = Math.floor(Math.random() * 10) + 12;
      const won = playerTotal > dealerTotal && playerTotal <= 21;
      const earnings = won ? amount * 2 : -amount;

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Blackjack', `Your hand: ${playerTotal}, Dealer: ${dealerTotal}. You ${won ? 'won' : 'lost'} ${Math.abs(earnings).toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRoulette(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const amount = i.options.getInteger('amount', true);
    const bet = i.options.getString('bet', true);
    const prisma = getPrismaClient();

    try {
      const validation = await validationService.validateEconomyTransaction(i, amount);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      const result = Math.floor(Math.random() * 37);
      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result);
      const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(result);
      const isGreen = result === 0;

      let won = false;
      let multiplier = 0;

      if (bet === 'red' && isRed) { won = true; multiplier = 2; }
      else if (bet === 'black' && isBlack) { won = true; multiplier = 2; }
      else if (bet === 'green' && isGreen) { won = true; multiplier = 35; }

      const earnings = Math.floor(amount * multiplier) - amount;

      await prisma.economy.update({
        where: { userId: i.user.id },
        data: { wallet: { increment: earnings } },
      });

      const embed = EmbedManager.economy('Roulette', `Result: ${result} (${isGreen ? 'Green' : isRed ? 'Red' : 'Black'}). You ${won ? 'won' : 'lost'} ${Math.abs(earnings).toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Business Handlers (simplified)
  private async handleBusinessStart(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const name = i.options.getString('name', true);
    const type = i.options.getString('type', true);
    const prisma = getPrismaClient();

    try {
      const existing = await prisma.business.findFirst({
        where: { ownerId: i.user.id },
      });

      if (existing) {
        await ErrorHandler.generic(i, new Error('You already own a business'));
        return;
      }

      const cost = 10000;
      const validation = await validationService.validateEconomyTransaction(i, cost);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { decrement: cost } },
        }),
        prisma.business.create({
          data: { ownerId: i.user.id, name, type, level: 1, revenue: 0, createdAt: new Date() },
        }),
      ]);

      const embed = EmbedManager.economy('Business Started', `You started ${name} (${type}) for ${cost.toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBusinessUpgrade(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const business = await prisma.business.findFirst({
        where: { ownerId: i.user.id },
      });

      if (!business) {
        await ErrorHandler.generic(i, new Error('You do not own a business'));
        return;
      }

      const upgradeCost = business.level * 5000;
      const validation = await validationService.validateEconomyTransaction(i, upgradeCost);
      if (!validation.valid) {
        await ErrorHandler.generic(i, new Error(validation.error));
        return;
      }

      await prisma.$transaction([
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { decrement: upgradeCost } },
        }),
        prisma.business.update({
          where: { id: business.id },
          data: { level: { increment: 1 } },
        }),
      ]);

      const embed = EmbedManager.economy('Business Upgraded', `Upgraded ${business.name} to level ${business.level + 1} for ${upgradeCost.toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBusinessSell(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const prisma = getPrismaClient();

    try {
      const business = await prisma.business.findFirst({
        where: { ownerId: i.user.id },
      });

      if (!business) {
        await ErrorHandler.generic(i, new Error('You do not own a business'));
        return;
      }

      const sellPrice = business.level * 3000;

      await prisma.$transaction([
        prisma.business.delete({
          where: { id: business.id },
        }),
        prisma.economy.update({
          where: { userId: i.user.id },
          data: { wallet: { increment: sellPrice } },
        }),
      ]);

      const embed = EmbedManager.economy('Business Sold', `Sold ${business.name} for ${sellPrice.toLocaleString()} coins!`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBusinessInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const business = await prisma.business.findFirst({
        where: { ownerId: user.id },
      });

      if (!business) {
        const embed = EmbedManager.economy('User Business', `${user.tag} does not own a business`, { timestamp: true });
        await i.editReply({ embeds: [embed] });
        return;
      }

      const embed = EmbedManager.economy('Business Info', `${business.name} (${business.type})`, {
        fields: [
          { name: '📊 Level', value: `${business.level}`, inline: true },
          { name: '💰 Revenue', value: `${business.revenue.toLocaleString()} coins`, inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(business.createdAt.getTime() / 1000)}:R>`, inline: true },
        ],
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Other Handlers
  private async handleLeaderboard(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const type = i.options.getString('type') || 'balance';
    const prisma = getPrismaClient();

    try {
      const economies = await prisma.economy.findMany({
        orderBy: { wallet: 'desc' },
        take: 10,
      });

      const embed = EmbedManager.economy('Economy Leaderboard', `Top 10 by ${type}`, {
        fields: economies.map((eco, i) => ({
          name: `#${i + 1} <@${eco.userId}>`,
          value: `${eco.wallet.toLocaleString()} coins`,
          inline: false,
        })),
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleProfile(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();

    try {
      const economy = await prisma.economy.findUnique({
        where: { userId: user.id },
      });

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const total = wallet + bank;

      const embed = EmbedManager.economy('Economy Profile', `${user.tag}'s profile`, {
        fields: [
          { name: '💰 Wallet', value: `${wallet.toLocaleString()} coins`, inline: true },
          { name: '🏦 Bank', value: `${bank.toLocaleString()} coins`, inline: true },
          { name: '💎 Net Worth', value: `${total.toLocaleString()} coins`, inline: true },
        ],
        thumbnail: { url: user.displayAvatarURL() },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /economy for full options.' });
  }
}

export default EconomyCommand;

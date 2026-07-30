// @ts-nocheck
import { Client, Emoji } from 'discord.js';

export interface EmojiConfig {
  id?: string;
  name: string;
  animated?: boolean;
  fallback: string;
}

export interface CategoryEmojis {
  admin: Record<string, EmojiConfig>;
  ai: Record<string, EmojiConfig>;
  applications: Record<string, EmojiConfig>;
  context: Record<string, EmojiConfig>;
  economy: Record<string, EmojiConfig>;
  fun: Record<string, EmojiConfig>;
  games: Record<string, EmojiConfig>;
  giveaway: Record<string, EmojiConfig>;
  help: Record<string, EmojiConfig>;
  image: Record<string, EmojiConfig>;
  info: Record<string, EmojiConfig>;
  leveling: Record<string, EmojiConfig>;
  moderation: Record<string, EmojiConfig>;
  music: Record<string, EmojiConfig>;
  owner: Record<string, EmojiConfig>;
  premium: Record<string, EmojiConfig>;
  social: Record<string, EmojiConfig>;
  starboard: Record<string, EmojiConfig>;
  utility: Record<string, EmojiConfig>;
}

class EmojiManager {
  private client: Client | null = null;
  private cache: Map<string, string> = new Map();
  private registry: CategoryEmojis;

  constructor() {
    this.registry = this.initializeRegistry();
  }

  public setClient(client: Client): void {
    this.client = client;
    this.cache.clear();
  }

  private initializeRegistry(): CategoryEmojis {
    return {
      admin: {
        config: { name: 'admin_config', fallback: '⚙️' },
        ban: { name: 'admin_ban', fallback: '🔨' },
        kick: { name: 'admin_kick', fallback: '👢' },
        mute: { name: 'admin_mute', fallback: '🔇' },
        lock: { name: 'admin_lock', fallback: '🔒' },
        unlock: { name: 'admin_unlock', fallback: '🔓' },
        purge: { name: 'admin_purge', fallback: '🧹' },
        settings: { name: 'admin_settings', fallback: '🛠️' },
      },
      ai: {
        chat: { name: 'ai_chat', fallback: '🤖' },
        image: { name: 'ai_image', fallback: '🎨' },
        code: { name: 'ai_code', fallback: '💻' },
        translate: { name: 'ai_translate', fallback: '🌐' },
        summarize: { name: 'ai_summarize', fallback: '📝' },
        analyze: { name: 'ai_analyze', fallback: '🔍' },
      },
      applications: {
        create: { name: 'app_create', fallback: '📝' },
        submit: { name: 'app_submit', fallback: '✅' },
        review: { name: 'app_review', fallback: '👀' },
        approve: { name: 'app_approve', fallback: '✅' },
        reject: { name: 'app_reject', fallback: '❌' },
      },
      context: {
        user: { name: 'ctx_user', fallback: '👤' },
        message: { name: 'ctx_message', fallback: '💬' },
        channel: { name: 'ctx_channel', fallback: '#️⃣' },
        server: { name: 'ctx_server', fallback: '🏠' },
      },
      economy: {
        coins: { name: 'eco_coins', fallback: '💰' },
        wallet: { name: 'eco_wallet', fallback: '👛' },
        bank: { name: 'eco_bank', fallback: '🏦' },
        shop: { name: 'eco_shop', fallback: '🛒' },
        inventory: { name: 'eco_inventory', fallback: '🎒' },
        daily: { name: 'eco_daily', fallback: '📅' },
        transfer: { name: 'eco_transfer', fallback: '💸' },
      },
      fun: {
        dice: { name: 'fun_dice', fallback: '🎲' },
        coinflip: { name: 'fun_coinflip', fallback: '🪙' },
        meme: { name: 'fun_meme', fallback: '😂' },
        joke: { name: 'fun_joke', fallback: '😄' },
        trivia: { name: 'fun_trivia', fallback: '❓' },
        rate: { name: 'fun_rate', fallback: '⭐' },
      },
      games: {
        tic_tac_toe: { name: 'game_ttt', fallback: '⭕' },
        hangman: { name: 'game_hangman', fallback: '🎯' },
        snake: { name: 'game_snake', fallback: '🐍' },
        memory: { name: 'game_memory', fallback: '🧠' },
        quiz: { name: 'game_quiz', fallback: '📚' },
      },
      giveaway: {
        gift: { name: 'ga_gift', fallback: '🎁' },
        ticket: { name: 'ga_ticket', fallback: '🎟️' },
        winner: { name: 'ga_winner', fallback: '🏆' },
        end: { name: 'ga_end', fallback: '⏰' },
        reroll: { name: 'ga_reroll', fallback: '🔄' },
      },
      help: {
        info: { name: 'help_info', fallback: 'ℹ️' },
        command: { name: 'help_command', fallback: '📋' },
        category: { name: 'help_category', fallback: '📁' },
        search: { name: 'help_search', fallback: '🔍' },
      },
      image: {
        generate: { name: 'img_generate', fallback: '🖼️' },
        edit: { name: 'img_edit', fallback: '✏️' },
        filter: { name: 'img_filter', fallback: '🎨' },
        meme: { name: 'img_meme', fallback: '😂' },
        caption: { name: 'img_caption', fallback: '💬' },
      },
      info: {
        server: { name: 'info_server', fallback: '🏠' },
        user: { name: 'info_user', fallback: '👤' },
        role: { name: 'info_role', fallback: '🎭' },
        channel: { name: 'info_channel', fallback: '#️⃣' },
        avatar: { name: 'info_avatar', fallback: '🖼️' },
        banner: { name: 'info_banner', fallback: '🎨' },
      },
      leveling: {
        level: { name: 'lvl_level', fallback: '📈' },
        xp: { name: 'lvl_xp', fallback: '⭐' },
        rank: { name: 'lvl_rank', fallback: '🏅' },
        leaderboard: { name: 'lvl_leaderboard', fallback: '🏆' },
        card: { name: 'lvl_card', fallback: '🃏' },
      },
      moderation: {
        warn: { name: 'mod_warn', fallback: '⚠️' },
        mute: { name: 'mod_mute', fallback: '🔇' },
        kick: { name: 'mod_kick', fallback: '👢' },
        ban: { name: 'mod_ban', fallback: '🔨' },
        unban: { name: 'mod_unban', fallback: '🔓' },
        timeout: { name: 'mod_timeout', fallback: '⏱️' },
        purge: { name: 'mod_purge', fallback: '🧹' },
        lock: { name: 'mod_lock', fallback: '🔒' },
        unlock: { name: 'mod_unlock', fallback: '🔓' },
      },
      music: {
        play: { name: 'music_play', fallback: '▶️' },
        pause: { name: 'music_pause', fallback: '⏸️' },
        stop: { name: 'music_stop', fallback: '⏹️' },
        skip: { name: 'music_skip', fallback: '⏭️' },
        previous: { name: 'music_previous', fallback: '⏮️' },
        shuffle: { name: 'music_shuffle', fallback: '🔀' },
        loop: { name: 'music_loop', fallback: '🔁' },
        queue: { name: 'music_queue', fallback: '📜' },
        volume: { name: 'music_volume', fallback: '🔊' },
        lyrics: { name: 'music_lyrics', fallback: '🎵' },
        nowplaying: { name: 'music_np', fallback: '🎶' },
        search: { name: 'music_search', fallback: '🔍' },
        playlist: { name: 'music_playlist', fallback: '📁' },
        filter: { name: 'music_filter', fallback: '🎚️' },
        radio: { name: 'music_radio', fallback: '📻' },
      },
      owner: {
        reload: { name: 'owner_reload', fallback: '🔄' },
        restart: { name: 'owner_restart', fallback: '🔁' },
        shutdown: { name: 'owner_shutdown', fallback: '🛑' },
        eval: { name: 'owner_eval', fallback: '💻' },
        shell: { name: 'owner_shell', fallback: '⌨️' },
        database: { name: 'owner_db', fallback: '🗄️' },
        redis: { name: 'owner_redis', fallback: '🔴' },
        stats: { name: 'owner_stats', fallback: '📊' },
      },
      premium: {
        star: { name: 'prem_star', fallback: '⭐' },
        crown: { name: 'prem_crown', fallback: '👑' },
        gem: { name: 'prem_gem', fallback: '💎' },
        key: { name: 'prem_key', fallback: '🔑' },
        activate: { name: 'prem_activate', fallback: '✅' },
        status: { name: 'prem_status', fallback: '📊' },
        tier: { name: 'prem_tier', fallback: '🏆' },
      },
      social: {
        profile: { name: 'soc_profile', fallback: '👤' },
        marry: { name: 'soc_marry', fallback: '💕' },
        divorce: { name: 'soc_divorce', fallback: '💔' },
        hug: { name: 'soc_hug', fallback: '🤗' },
        kiss: { name: 'soc_kiss', fallback: '😘' },
        slap: { name: 'soc_slap', fallback: '👋' },
        highfive: { name: 'soc_highfive', fallback: '✋' },
        rep: { name: 'soc_rep', fallback: '👍' },
      },
      starboard: {
        star: { name: 'sb_star', fallback: '⭐' },
        message: { name: 'sb_message', fallback: '💬' },
        leaderboard: { name: 'sb_leaderboard', fallback: '🏆' },
        stats: { name: 'sb_stats', fallback: '📊' },
        random: { name: 'sb_random', fallback: '🎲' },
      },
      utility: {
        avatar: { name: 'util_avatar', fallback: '🖼️' },
        userinfo: { name: 'util_userinfo', fallback: '👤' },
        serverinfo: { name: 'util_serverinfo', fallback: '🏠' },
        roleinfo: { name: 'util_roleinfo', fallback: '🎭' },
        channelinfo: { name: 'util_channelinfo', fallback: '#️⃣' },
        emoji: { name: 'util_emoji', fallback: '😀' },
        poll: { name: 'util_poll', fallback: '📊' },
        reminder: { name: 'util_reminder', fallback: '⏰' },
        timer: { name: 'util_timer', fallback: '⏱️' },
        calculator: { name: 'util_calc', fallback: '🧮' },
        search: { name: 'util_search', fallback: '🔍' },
        translate: { name: 'util_translate', fallback: '🌐' },
      },
    };
  }

  public get(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const config = this.registry[category]?.[key];
    if (!config) {
      return this.registry.utility.search?.fallback || '❓';
    }

    if (!this.client || !config.id) {
      this.cache.set(cacheKey, config.fallback);
      return config.fallback;
    }

    try {
      const emoji = this.client.emojis.cache.get(config.id);
      if (emoji) {
        const emojiString = emoji.toString();
        this.cache.set(cacheKey, emojiString);
        return emojiString;
      }
    } catch (error) {
      // Silent fallback to Unicode
    }

    this.cache.set(cacheKey, config.fallback);
    return config.fallback;
  }

  public getAnimated(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}:animated`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const config = this.registry[category]?.[key];
    if (!config) {
      return this.registry.utility.search?.fallback || '❓';
    }

    if (!this.client || !config.id || !config.animated) {
      this.cache.set(cacheKey, config.fallback);
      return config.fallback;
    }

    try {
      const emoji = this.client.emojis.cache.get(config.id);
      if (emoji && emoji.animated) {
        const emojiString = emoji.toString();
        this.cache.set(cacheKey, emojiString);
        return emojiString;
      }
    } catch (error) {
      // Silent fallback to Unicode
    }

    this.cache.set(cacheKey, config.fallback);
    return config.fallback;
  }

  public getStatic(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}:static`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const config = this.registry[category]?.[key];
    if (!config) {
      return this.registry.utility.search?.fallback || '❓';
    }

    if (!this.client || !config.id || config.animated) {
      this.cache.set(cacheKey, config.fallback);
      return config.fallback;
    }

    try {
      const emoji = this.client.emojis.cache.get(config.id);
      if (emoji && !emoji.animated) {
        const emojiString = emoji.toString();
        this.cache.set(cacheKey, emojiString);
        return emojiString;
      }
    } catch (error) {
      // Silent fallback to Unicode
    }

    this.cache.set(cacheKey, config.fallback);
    return config.fallback;
  }

  public getAll(category: keyof CategoryEmojis): Record<string, string> {
    const result: Record<string, string> = {};
    const categoryConfig = this.registry[category];
    
    if (!categoryConfig) return result;

    for (const [key] of Object.entries(categoryConfig)) {
      result[key] = this.get(category, key);
    }

    return result;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public registerCustomEmoji(category: keyof CategoryEmojis, key: string, config: EmojiConfig): void {
    if (!this.registry[category]) {
      this.registry[category] = {} as any;
    }
    this.registry[category][key] = config;
    this.cache.delete(`${category}:${key}`);
  }

  public getRegistry(): CategoryEmojis {
    return this.registry;
  }
}

export const emojiManager = new EmojiManager();
export default emojiManager;

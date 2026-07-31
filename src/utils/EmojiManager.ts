// @ts-nocheck
import { Client } from 'discord.js';

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

  /**
   * Resolve an emoji string for a registry entry.
   * Priority: hardcoded ID → name-based lookup in client emoji cache → Unicode fallback.
   *
   * Name-based lookup: if you add emoji to your bot's servers (or an emoji guild) using
   * the exact names listed below (e.g. "music_play", "eco_coins"), the bot will
   * automatically find and use them without any ID configuration needed.
   */
  private resolveEmoji(config: EmojiConfig, animatedOnly?: boolean, staticOnly?: boolean): string {
    if (!this.client) return config.fallback;

    // 1. Try lookup by hardcoded ID
    if (config.id) {
      try {
        const emoji = this.client.emojis.cache.get(config.id);
        if (emoji) {
          if (animatedOnly && !emoji.animated) { /* fall through */ }
          else if (staticOnly && emoji.animated) { /* fall through */ }
          else return emoji.toString();
        }
      } catch { /* silent */ }
    }

    // 2. Try name-based lookup — finds emojis added to any server the bot is in
    try {
      const emoji = this.client.emojis.cache.find(e => e.name === config.name);
      if (emoji) {
        if (animatedOnly && !emoji.animated) { /* fall through */ }
        else if (staticOnly && emoji.animated) { /* fall through */ }
        else return emoji.toString();
      }
    } catch { /* silent */ }

    // 3. Unicode fallback
    return config.fallback;
  }

  private initializeRegistry(): CategoryEmojis {
    return {
      // ── Admin ──────────────────────────────────────────────────────────────
      admin: {
        config:   { name: 'admin_config',   fallback: '⚙️' },
        ban:      { name: 'admin_ban',       fallback: '🔨' },
        kick:     { name: 'admin_kick',      fallback: '👢' },
        mute:     { name: 'admin_mute',      fallback: '🔇' },
        lock:     { name: 'admin_lock',      fallback: '🔒' },
        unlock:   { name: 'admin_unlock',    fallback: '🔓' },
        purge:    { name: 'admin_purge',     fallback: '🧹' },
        settings: { name: 'admin_settings',  fallback: '🛠️' },
      },
      // ── AI ─────────────────────────────────────────────────────────────────
      ai: {
        chat:      { name: 'ai_chat',      animated: true,  fallback: '🤖' },
        image:     { name: 'ai_image',     fallback: '🎨' },
        code:      { name: 'ai_code',      fallback: '💻' },
        translate: { name: 'ai_translate', fallback: '🌐' },
        summarize: { name: 'ai_summarize', fallback: '📝' },
        analyze:   { name: 'ai_analyze',   animated: true,  fallback: '🔍' },
        thinking:  { name: 'ai_thinking',  animated: true,  fallback: '💭' },
      },
      // ── Applications ───────────────────────────────────────────────────────
      applications: {
        create:  { name: 'app_create',  fallback: '📝' },
        submit:  { name: 'app_submit',  fallback: '✅' },
        review:  { name: 'app_review',  fallback: '👀' },
        approve: { name: 'app_approve', fallback: '✅' },
        reject:  { name: 'app_reject',  fallback: '❌' },
      },
      // ── Context ────────────────────────────────────────────────────────────
      context: {
        user:    { name: 'ctx_user',    fallback: '👤' },
        message: { name: 'ctx_message', fallback: '💬' },
        channel: { name: 'ctx_channel', fallback: '#️⃣' },
        server:  { name: 'ctx_server',  fallback: '🏠' },
        loading: { name: 'ctx_loading', animated: true, fallback: '⏳' },
      },
      // ── Economy ────────────────────────────────────────────────────────────
      economy: {
        coins:     { name: 'eco_coins',     fallback: '💰' },
        wallet:    { name: 'eco_wallet',    fallback: '👛' },
        bank:      { name: 'eco_bank',      fallback: '🏦' },
        shop:      { name: 'eco_shop',      fallback: '🛒' },
        inventory: { name: 'eco_inventory', fallback: '🎒' },
        daily:     { name: 'eco_daily',     fallback: '📅' },
        transfer:  { name: 'eco_transfer',  fallback: '💸' },
        work:      { name: 'eco_work',      fallback: '⚒️' },
        crime:     { name: 'eco_crime',     fallback: '🕵️' },
      },
      // ── Fun ────────────────────────────────────────────────────────────────
      fun: {
        dice:     { name: 'fun_dice',     animated: true,  fallback: '🎲' },
        coinflip: { name: 'fun_coinflip', animated: true,  fallback: '🪙' },
        meme:     { name: 'fun_meme',     fallback: '😂' },
        joke:     { name: 'fun_joke',     fallback: '😄' },
        trivia:   { name: 'fun_trivia',   fallback: '❓' },
        rate:     { name: 'fun_rate',     fallback: '⭐' },
      },
      // ── Games ──────────────────────────────────────────────────────────────
      games: {
        tic_tac_toe: { name: 'game_ttt',     fallback: '⭕' },
        hangman:     { name: 'game_hangman', fallback: '🎯' },
        snake:       { name: 'game_snake',   fallback: '🐍' },
        memory:      { name: 'game_memory',  fallback: '🧠' },
        quiz:        { name: 'game_quiz',    fallback: '📚' },
      },
      // ── Giveaway ───────────────────────────────────────────────────────────
      giveaway: {
        gift:    { name: 'ga_gift',   animated: true,  fallback: '🎁' },
        ticket:  { name: 'ga_ticket', fallback: '🎟️' },
        winner:  { name: 'ga_winner', animated: true,  fallback: '🏆' },
        end:     { name: 'ga_end',    fallback: '⏰' },
        reroll:  { name: 'ga_reroll', animated: true,  fallback: '🔄' },
      },
      // ── Help ───────────────────────────────────────────────────────────────
      help: {
        info:     { name: 'help_info',     fallback: 'ℹ️' },
        command:  { name: 'help_command',  fallback: '📋' },
        category: { name: 'help_category', fallback: '📁' },
        search:   { name: 'help_search',   fallback: '🔍' },
        tip:      { name: 'help_tip',      fallback: '💡' },
      },
      // ── Image ──────────────────────────────────────────────────────────────
      image: {
        generate: { name: 'img_generate', animated: true, fallback: '🖼️' },
        edit:     { name: 'img_edit',     fallback: '✏️' },
        filter:   { name: 'img_filter',   fallback: '🎨' },
        meme:     { name: 'img_meme',     fallback: '😂' },
        caption:  { name: 'img_caption',  fallback: '💬' },
      },
      // ── Info ───────────────────────────────────────────────────────────────
      info: {
        server:  { name: 'info_server',  fallback: '🏠' },
        user:    { name: 'info_user',    fallback: '👤' },
        role:    { name: 'info_role',    fallback: '🎭' },
        channel: { name: 'info_channel', fallback: '#️⃣' },
        avatar:  { name: 'info_avatar',  fallback: '🖼️' },
        banner:  { name: 'info_banner',  fallback: '🎨' },
        bot:     { name: 'info_bot',     fallback: '🤖' },
      },
      // ── Leveling ───────────────────────────────────────────────────────────
      leveling: {
        level:       { name: 'lvl_level',       animated: true, fallback: '📈' },
        xp:          { name: 'lvl_xp',           fallback: '⭐' },
        rank:        { name: 'lvl_rank',         fallback: '🏅' },
        leaderboard: { name: 'lvl_leaderboard',  fallback: '🏆' },
        card:        { name: 'lvl_card',         fallback: '🃏' },
        levelup:     { name: 'lvl_levelup',      animated: true, fallback: '🎉' },
      },
      // ── Moderation ─────────────────────────────────────────────────────────
      moderation: {
        warn:    { name: 'mod_warn',    fallback: '⚠️' },
        mute:    { name: 'mod_mute',    fallback: '🔇' },
        kick:    { name: 'mod_kick',    fallback: '👢' },
        ban:     { name: 'mod_ban',     fallback: '🔨' },
        unban:   { name: 'mod_unban',   fallback: '🔓' },
        timeout: { name: 'mod_timeout', fallback: '⏱️' },
        purge:   { name: 'mod_purge',   fallback: '🧹' },
        lock:    { name: 'mod_lock',    fallback: '🔒' },
        unlock:  { name: 'mod_unlock',  fallback: '🔓' },
        case:    { name: 'mod_case',    fallback: '📋' },
      },
      // ── Music ──────────────────────────────────────────────────────────────
      music: {
        play:       { name: 'music_play',       animated: true,  fallback: '▶️' },
        pause:      { name: 'music_pause',       fallback: '⏸️' },
        stop:       { name: 'music_stop',        fallback: '⏹️' },
        skip:       { name: 'music_skip',        animated: true,  fallback: '⏭️' },
        previous:   { name: 'music_previous',    fallback: '⏮️' },
        shuffle:    { name: 'music_shuffle',     animated: true,  fallback: '🔀' },
        loop:       { name: 'music_loop',        fallback: '🔁' },
        queue:      { name: 'music_queue',       fallback: '📜' },
        volume:     { name: 'music_volume',      fallback: '🔊' },
        lyrics:     { name: 'music_lyrics',      fallback: '🎵' },
        nowplaying: { name: 'music_np',          animated: true,  fallback: '🎶' },
        search:     { name: 'music_search',      animated: true,  fallback: '🔍' },
        playlist:   { name: 'music_playlist',    fallback: '📁' },
        filter:     { name: 'music_filter',      fallback: '🎚️' },
        radio:      { name: 'music_radio',       fallback: '📻' },
        loading:    { name: 'music_loading',     animated: true,  fallback: '⏳' },
      },
      // ── Owner ──────────────────────────────────────────────────────────────
      owner: {
        reload:   { name: 'owner_reload',   animated: true,  fallback: '🔄' },
        restart:  { name: 'owner_restart',  animated: true,  fallback: '🔁' },
        shutdown: { name: 'owner_shutdown', fallback: '🛑' },
        eval:     { name: 'owner_eval',     fallback: '💻' },
        shell:    { name: 'owner_shell',    fallback: '⌨️' },
        database: { name: 'owner_db',       fallback: '🗄️' },
        redis:    { name: 'owner_redis',    fallback: '🔴' },
        stats:    { name: 'owner_stats',    fallback: '📊' },
      },
      // ── Premium ────────────────────────────────────────────────────────────
      premium: {
        star:     { name: 'prem_star',     animated: true,  fallback: '⭐' },
        crown:    { name: 'prem_crown',    fallback: '👑' },
        gem:      { name: 'prem_gem',      fallback: '💎' },
        key:      { name: 'prem_key',      fallback: '🔑' },
        activate: { name: 'prem_activate', animated: true,  fallback: '✅' },
        status:   { name: 'prem_status',   fallback: '📊' },
        tier:     { name: 'prem_tier',     fallback: '🏆' },
        bronze:   { name: 'prem_bronze',   fallback: '🥉' },
        silver:   { name: 'prem_silver',   fallback: '🥈' },
        gold:     { name: 'prem_gold',     fallback: '🥇' },
        diamond:  { name: 'prem_diamond',  animated: true,  fallback: '💎' },
      },
      // ── Social ─────────────────────────────────────────────────────────────
      social: {
        profile:   { name: 'soc_profile',   fallback: '👤' },
        marry:     { name: 'soc_marry',     animated: true,  fallback: '💕' },
        divorce:   { name: 'soc_divorce',   fallback: '💔' },
        hug:       { name: 'soc_hug',       animated: true,  fallback: '🤗' },
        kiss:      { name: 'soc_kiss',      fallback: '😘' },
        slap:      { name: 'soc_slap',      animated: true,  fallback: '👋' },
        highfive:  { name: 'soc_highfive',  animated: true,  fallback: '✋' },
        rep:       { name: 'soc_rep',       fallback: '👍' },
        cuddle:    { name: 'soc_cuddle',    animated: true,  fallback: '🫂' },
        pat:       { name: 'soc_pat',       animated: true,  fallback: '🤚' },
      },
      // ── Starboard ──────────────────────────────────────────────────────────
      starboard: {
        star:        { name: 'sb_star',        animated: true,  fallback: '⭐' },
        message:     { name: 'sb_message',     fallback: '💬' },
        leaderboard: { name: 'sb_leaderboard', fallback: '🏆' },
        stats:       { name: 'sb_stats',       fallback: '📊' },
        random:      { name: 'sb_random',      fallback: '🎲' },
      },
      // ── Utility ────────────────────────────────────────────────────────────
      utility: {
        avatar:      { name: 'util_avatar',      fallback: '🖼️' },
        userinfo:    { name: 'util_userinfo',     fallback: '👤' },
        serverinfo:  { name: 'util_serverinfo',   fallback: '🏠' },
        roleinfo:    { name: 'util_roleinfo',     fallback: '🎭' },
        channelinfo: { name: 'util_channelinfo',  fallback: '#️⃣' },
        emoji:       { name: 'util_emoji',        fallback: '😀' },
        poll:        { name: 'util_poll',         fallback: '📊' },
        reminder:    { name: 'util_reminder',     fallback: '⏰' },
        timer:       { name: 'util_timer',        fallback: '⏱️' },
        calculator:  { name: 'util_calc',         fallback: '🧮' },
        search:      { name: 'util_search',       fallback: '🔍' },
        translate:   { name: 'util_translate',    fallback: '🌐' },
        // Status emojis (animated variants for richer UX)
        loading:     { name: 'util_loading',      animated: true,  fallback: '⏳' },
        success:     { name: 'util_success',      animated: true,  fallback: '✅' },
        error:       { name: 'util_error',        fallback: '❌' },
        warning:     { name: 'util_warning',      fallback: '⚠️' },
        processing:  { name: 'util_processing',   animated: true,  fallback: '⚙️' },
        searching:   { name: 'util_searching',    animated: true,  fallback: '🔍' },
        downloading: { name: 'util_downloading',  animated: true,  fallback: '⬇️' },
        uploading:   { name: 'util_uploading',    animated: true,  fallback: '⬆️' },
        cooldown:    { name: 'util_cooldown',     animated: true,  fallback: '⌛' },
        notification: { name: 'util_notification', animated: true, fallback: '🔔' },
      },
    };
  }

  /**
   * Get the emoji string for a category/key.
   * Tries hardcoded ID → name lookup in client cache → Unicode fallback.
   */
  public get(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const config = this.registry[category]?.[key];
    if (!config) return this.registry.utility.error?.fallback ?? '❓';

    const result = this.resolveEmoji(config);
    this.cache.set(cacheKey, result);
    return result;
  }

  /** Get the animated emoji string, or Unicode fallback if not animated/not found. */
  public getAnimated(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}:animated`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const config = this.registry[category]?.[key];
    if (!config) return this.registry.utility.error?.fallback ?? '❓';

    const result = config.animated ? this.resolveEmoji(config, true, false) : config.fallback;
    this.cache.set(cacheKey, result);
    return result;
  }

  /** Get a static (non-animated) emoji, falling back to Unicode. */
  public getStatic(category: keyof CategoryEmojis, key: string): string {
    const cacheKey = `${category}:${key}:static`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const config = this.registry[category]?.[key];
    if (!config) return this.registry.utility.error?.fallback ?? '❓';

    const result = !config.animated ? this.resolveEmoji(config, false, true) : config.fallback;
    this.cache.set(cacheKey, result);
    return result;
  }

  /** Get all resolved emoji strings for a category. */
  public getAll(category: keyof CategoryEmojis): Record<string, string> {
    const result: Record<string, string> = {};
    const cat = this.registry[category];
    if (!cat) return result;
    for (const key of Object.keys(cat)) {
      result[key] = this.get(category, key);
    }
    return result;
  }

  /**
   * List all emoji names that should be uploaded to a guild for full animated support.
   * Prints a helpful table for server admins.
   */
  public listRequiredEmojis(): Array<{ name: string; animated: boolean; category: string }> {
    const result: Array<{ name: string; animated: boolean; category: string }> = [];
    for (const [category, emojis] of Object.entries(this.registry)) {
      for (const [, config] of Object.entries(emojis as Record<string, EmojiConfig>)) {
        result.push({ name: config.name, animated: config.animated ?? false, category });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Register a custom emoji ID for a known registry entry.
   * Call this at startup if you have a dedicated emoji guild and known IDs.
   */
  public registerEmoji(category: keyof CategoryEmojis, key: string, id: string): void {
    const config = this.registry[category]?.[key];
    if (config) {
      config.id = id;
      this.cache.delete(`${category}:${key}`);
      this.cache.delete(`${category}:${key}:animated`);
      this.cache.delete(`${category}:${key}:static`);
    }
  }

  public registerCustomEmoji(category: keyof CategoryEmojis, key: string, config: EmojiConfig): void {
    if (!this.registry[category]) (this.registry as any)[category] = {};
    this.registry[category][key] = config;
    this.cache.delete(`${category}:${key}`);
  }

  public clearCache(): void { this.cache.clear(); }
  public getRegistry(): CategoryEmojis { return this.registry; }
}

export const emojiManager = new EmojiManager();
export default emojiManager;

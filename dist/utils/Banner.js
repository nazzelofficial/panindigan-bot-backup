// @ts-nocheck
import chalk from 'chalk';
import os from 'os';
// ─── ASCII Banner ─────────────────────────────────────────────────────────────
const LOGO = [
    '██████╗  █████╗ ███╗   ██╗██╗███╗   ██╗██████╗ ██╗ ██████╗  █████╗ ███╗   ██╗',
    '██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔══██╗██║██╔════╝ ██╔══██╗████╗  ██║',
    '██████╔╝███████║██╔██╗ ██║██║██╔██╗ ██║██║  ██║██║██║  ███╗███████║██╔██╗ ██║',
    '██╔═══╝ ██╔══██║██║╚██╗██║██║██║╚██╗██║██║  ██║██║██║   ██║██╔══██║██║╚██╗██║',
    '██║     ██║  ██║██║ ╚████║██║██║ ╚████║██████╔╝██║╚██████╔╝██║  ██║██║ ╚████║',
    '╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝',
];
const WIDTH = 82;
function center(text, width = WIDTH) {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
}
function divider(char = '─', width = WIDTH) {
    return chalk.gray(char.repeat(width));
}
function row(icon, label, value) {
    const sep = chalk.gray('│');
    const lbl = chalk.dim(label.padEnd(16));
    return `  ${icon}  ${sep}  ${lbl}  ${value}`;
}
function manilaTimestampFull() {
    return new Date().toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}
export function printBanner(opts) {
    const { version, environment, nodeVersion, mode = 'bot', shardCount } = opts;
    const envColor = environment === 'production' ? chalk.bgRed.white.bold
        : environment === 'staging' ? chalk.bgYellow.black.bold
            : chalk.bgGreen.black.bold;
    const modeLabel = mode === 'shard'
        ? chalk.magenta(`🔀  Shard Manager${shardCount !== undefined ? `  (${shardCount} shards)` : ''}`)
        : chalk.blue('🤖  Single Instance');
    // Top border
    process.stdout.write('\n');
    process.stdout.write(chalk.gray('╔' + '═'.repeat(WIDTH) + '╗') + '\n');
    process.stdout.write(chalk.gray('║') + ' '.repeat(WIDTH) + chalk.gray('║') + '\n');
    // Logo
    for (const line of LOGO) {
        const padded = center(line, WIDTH);
        process.stdout.write(chalk.gray('║') + chalk.cyan(padded) + chalk.gray('║') + '\n');
    }
    process.stdout.write(chalk.gray('║') + ' '.repeat(WIDTH) + chalk.gray('║') + '\n');
    // Tagline
    const tagline = 'All-in-One Filipino Discord Bot  ·  Commercial-Grade Quality';
    process.stdout.write(chalk.gray('║') + chalk.gray(center(tagline, WIDTH)) + chalk.gray('║') + '\n');
    process.stdout.write(chalk.gray('║') + ' '.repeat(WIDTH) + chalk.gray('║') + '\n');
    process.stdout.write(chalk.gray('╠' + '═'.repeat(WIDTH) + '╣') + '\n');
    // Info rows
    const rows = [
        ['🏷 ', 'Version', chalk.yellow.bold(`v${version}`)],
        ['⚙️ ', 'Mode', modeLabel],
        ['🌍', 'Environment', envColor(` ${environment.toUpperCase()} `)],
        ['💚', 'Node.js', chalk.cyan(nodeVersion)],
        ['🕐', 'Manila Time', chalk.white(manilaTimestampFull())],
        ['💻', 'Hostname', chalk.gray(os.hostname())],
        ['🔢', 'PID', chalk.gray(String(process.pid))],
        ['📦', 'Platform', chalk.gray(`${os.platform()} ${os.arch()}`)],
    ];
    process.stdout.write(chalk.gray('║') + ' '.repeat(WIDTH) + chalk.gray('║') + '\n');
    for (const [icon, label, value] of rows) {
        const line = row(icon, label, value);
        // Pad to WIDTH to fit between borders
        const stripped = line.replace(/\x1B\[[0-9;]*m/g, '');
        const pad = Math.max(0, WIDTH - stripped.length);
        process.stdout.write(chalk.gray('║') + line + ' '.repeat(pad) + chalk.gray('║') + '\n');
    }
    process.stdout.write(chalk.gray('║') + ' '.repeat(WIDTH) + chalk.gray('║') + '\n');
    // Bottom border
    process.stdout.write(chalk.gray('╚' + '═'.repeat(WIDTH) + '╝') + '\n');
    process.stdout.write('\n');
}
//# sourceMappingURL=Banner.js.map
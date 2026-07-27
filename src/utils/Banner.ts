// @ts-nocheck
import chalk from 'chalk';

// ─── ASCII Banner ─────────────────────────────────────────────────────────────

const LOGO = [
  '██████╗  █████╗ ███╗   ██╗██╗███╗   ██╗██████╗ ██╗ ██████╗  █████╗ ███╗   ██╗',
  '██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔══██╗██║██╔════╝ ██╔══██╗████╗  ██║',
  '██████╔╝███████║██╔██╗ ██║██║██╔██╗ ██║██║  ██║██║██║  ███╗███████║██╔██╗ ██║',
  '██╔═══╝ ██╔══██║██║╚██╗██║██║██║╚██╗██║██║  ██║██║██║   ██║██╔══██║██║╚██╗██║',
  '██║     ██║  ██║██║ ╚████║██║██║ ╚████║██████╔╝██║╚██████╔╝██║  ██║██║ ╚████║',
  '╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝',
];

const WIDTH = 80;

function center(text: string, width = WIDTH): string {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function divider(width = WIDTH): string {
  return chalk.gray('─'.repeat(width));
}

export interface BannerOptions {
  version: string;
  environment: string;
  nodeVersion: string;
  mode?: 'bot' | 'shard';
  shardCount?: number | 'auto';
}

export function printBanner(opts: BannerOptions): void {
  const { version, environment, nodeVersion, mode = 'bot', shardCount } = opts;

  process.stdout.write('\n');

  for (const line of LOGO) {
    process.stdout.write(chalk.cyan(center(line)) + '\n');
  }

  process.stdout.write('\n');
  process.stdout.write(chalk.gray(center(`All-in-One Discord Bot  •  Filipino & English`, WIDTH)) + '\n');
  process.stdout.write('\n');
  process.stdout.write(divider() + '\n');

  const info: [string, string][] = [
    ['Version',     chalk.yellow(`v${version}`)],
    ['Mode',        mode === 'shard'
      ? chalk.magenta(`Shard Manager${shardCount !== undefined ? ` (${shardCount} shards)` : ''}`)
      : chalk.blue('Single Instance')],
    ['Environment', environment === 'production'
      ? chalk.red('production')
      : chalk.green(environment)],
    ['Node.js',     chalk.cyan(nodeVersion)],
    ['PID',         chalk.gray(String(process.pid))],
  ];

  for (const [label, value] of info) {
    const labelStr = chalk.dim(`${label.padEnd(14)}`);
    process.stdout.write(`  ${labelStr}  ${value}\n`);
  }

  process.stdout.write(divider() + '\n');
  process.stdout.write('\n');
}

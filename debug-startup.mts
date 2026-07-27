// Debug wrapper: patch process.exit and force error to stderr
const origExit = process.exit.bind(process)

// Patch loggers after import by intercepting winston
process.on('uncaughtException', (e) => {
  process.stderr.write('UNCAUGHT: ' + e.message + '\n' + (e.stack ?? '') + '\n')
  origExit(1)
})
process.on('unhandledRejection', (r) => {
  process.stderr.write('UNHANDLED: ' + String(r) + '\n')
  if (r instanceof Error) process.stderr.write((r.stack ?? '') + '\n')
  origExit(1)
})

// Patch logger module before index.ts imports it
const { loggers } = await import('./src/utils/Logger.ts')
const origBotError = loggers.bot.error.bind(loggers.bot)
loggers.bot.error = (msg: any, meta?: any) => {
  process.stderr.write('BOT_ERROR: ' + JSON.stringify({ msg, meta }) + '\n')
  return origBotError(msg, meta)
}

await import('./src/bot/index.ts')

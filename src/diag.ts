// @ts-nocheck
import 'dotenv/config';
import { readdirSync } from 'fs';
import { BaseCommand } from './structures/BaseCommand.js';
import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

async function main() {
  const folders = readdirSync('./src/commands');
  const commands: any[] = [];
  
  for (const folder of folders) {
    const files = readdirSync(`./src/commands/${folder}`).filter(f => f.endsWith('.ts'));
    for (const file of files) {
      try {
        const mod = await import(`./commands/${folder}/${file}`);
        const raw = mod.default || mod[Object.keys(mod)[0]];
        if (typeof raw !== 'function') continue;
        let cmd: any;
        try { cmd = new raw(); } catch(e: any) { console.log(`CTOR_ERR ${file}: ${e.message?.slice(0,80)}`); continue; }
        if (!(cmd instanceof BaseCommand)) continue;
        
        if (cmd.slashCommand) {
          try {
            const json = cmd.buildSlashCommand().toJSON();
            JSON.stringify(json);
            commands.push(json);
            console.log(`OK slash: ${cmd.name}`);
          } catch(e: any) {
            console.log(`BUILD_ERR ${cmd.name}: ${e.message}`);
          }
        }
        if (cmd.contextMenuCommand) {
          try {
            const b = new ContextMenuCommandBuilder()
              .setName(cmd.name)
              .setType(cmd.contextMenuType ?? ApplicationCommandType.Message);
            commands.push(b.toJSON());
            console.log(`OK ctx: ${cmd.name}`);
          } catch(e: any) {
            console.log(`CTX_ERR ${cmd.name}: ${e.message}`);
          }
        }
      } catch(e: any) {
        console.log(`IMPORT_ERR ${file}: ${e.message?.slice(0,80)}`);
      }
    }
  }
  
  try {
    const body = JSON.stringify(commands);
    console.log(`\nTotal: ${commands.length}, size: ${body.length} bytes — all OK`);
  } catch(e: any) {
    console.log(`SERIALIZE_ERR: ${e.message}`);
  }
}
main().catch(e => console.error('FATAL:', e.message));

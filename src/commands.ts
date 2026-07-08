import { setUser } from './config.js';

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = {
    [cmdName: string]: CommandHandler;
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
    if(!registry[cmdName]) {
        throw new Error(`Command not found: ${cmdName}`);
    }

    registry[cmdName](cmdName, ...args);
}

export function handlerLogin(cmdName: string, ...args: string[]): void {
  if(args.length < 1) {
    throw new Error(`Missing argument: username is expected`);
  }

  const username = args[0]; 
  setUser(username);
  console.log(`User has been set to: ${username}`);
}
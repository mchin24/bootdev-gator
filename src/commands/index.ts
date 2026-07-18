import { User } from "../db/schema.js";
import { getUserByName } from "../db/queries/users.js";
import { readConfig } from "../config.js";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export type CommandsRegistry = {
    [cmdName: string]: CommandHandler;
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    if(!registry[cmdName]) {
        throw new Error(`Command not found: ${cmdName}`);
    }

    await registry[cmdName](cmdName, ...args);
}

export function loggedInUser(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const config = readConfig();
        if(!config.currentUserName) {
            throw new Error('A user must be logged in to perform this action.');
        }
        const user = await getUserByName(config.currentUserName);
        if(!user) throw new Error(`User not found: ${config.currentUserName}`);
        await handler(cmdName, user, ...args)
    }
}
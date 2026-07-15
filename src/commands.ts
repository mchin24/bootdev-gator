import { setUser, readConfig } from './config.js';
import { createUser, getUserByName, deleteAllUsers, getUsers } from './db/queries/users.js';
import { DrizzleQueryError } from "drizzle-orm";
import { fetchFeed } from './rss.js';

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

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

    try {
        await registry[cmdName](cmdName, ...args);
    } catch (error: any) {
        throw error;
    }
}

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if(args.length < 1) {
    throw new Error(`Missing argument: username is expected`);
  }

  const username = args[0]; 

  try {
    const user = await getUserByName(username);
    if(!user) {
      throw new Error(`User not found: ${username}`);
    }
    setUser(user.name);
    console.log(`User has been set to: ${user.name}`);
  } catch (error: any) {
    throw error;
  }
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if(args.length < 1) {
        throw new Error(`Missing argument: username is expected`);
    }

    try {
        const username = args[0];
        const user = await createUser(username);
        setUser(username);
        console.log(`${username} has been registered.`);
        console.log(`User details: ${JSON.stringify(user)}`);
    } catch (err: any) {
        if(err instanceof DrizzleQueryError) {
            if(err.cause.code === '23505') {
                throw new Error(`User already exists.`);
            }
        }
        throw err;
    }
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    try {
        setUser('');
        await deleteAllUsers();
        console.log(`All users have been deleted.`);
    } catch (error: any) {
        throw error;
    }
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const config = readConfig();
        const currentUser = config.currentUserName ?? null;

        const users = await getUsers();
        for(const user of users) {
            console.log(`* ${user.name}` + (user.name === currentUser ? " (current)" : ""));
        }
    } catch (error: any) {
        throw error;
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log(JSON.stringify(feed));

    } catch (error: any) {
        throw error;
    }
}
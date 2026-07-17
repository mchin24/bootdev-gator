import { setUser, readConfig } from '../config.js';
import { createUser, getUserByName, deleteAllUsers, getUsers } from '../db/queries/users.js';
import { DrizzleQueryError } from "drizzle-orm";

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if(args.length < 1) {
    throw new Error(`Missing argument: user_name is expected`);
  }

  const user_name = args[0]; 

  const user = await getUserByName(user_name);
    if(!user) {
      throw new Error(`User not found: ${user_name}`);
    }
    setUser(user.name);
    console.log(`User has been set to: ${user.name}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if(args.length < 1) {
        throw new Error(`Missing argument: user name is expected`);
    }

    try {
        const user_name = args[0];
        const user = await createUser(user_name);
        setUser(user_name);
        console.log(`${user_name} has been registered.`);
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
    setUser('');
    await deleteAllUsers();
    console.log(`All users have been deleted.`);
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const config = readConfig();
    const currentUser = config.currentUserName ?? null;

    const users = await getUsers();
    for(const user of users) {
        console.log(`* ${user.name}` + (user.name === currentUser ? " (current)" : ""));
    }
}
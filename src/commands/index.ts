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

    await registry[cmdName](cmdName, ...args);
}
import { readConfig, setUser } from "./config.js";
import { CommandsRegistry, registerCommand, runCommand, handlerLogin } from "./commands.js";
import { exit } from "process";

function main() {
    const commandsRegistry: CommandsRegistry = {};
    registerCommand(commandsRegistry, "login", handlerLogin);
    
    const args = process.argv.slice(2);
    if(args.length < 1) {
        console.error("Missing command name");
        exit(1);
    }

    const cmdName = args[0];
    try {
        runCommand(commandsRegistry, cmdName, ...args.slice(1));
    } catch (error:any) {
        if(error instanceof Error) {
            console.error(error.message);
        }
        exit(1);
    }
}

main();
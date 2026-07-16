import { CommandsRegistry, registerCommand, runCommand } from "./commands/index.js";
import { handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./commands/users.js";
import { handlerAgg, handlerAddFeed, handlerFeeds } from "./commands/rss.js";

async function main() {
    const commandsRegistry: CommandsRegistry = {};
    registerCommand(commandsRegistry, "login", handlerLogin);
    registerCommand(commandsRegistry, "register", handlerRegister);
    registerCommand(commandsRegistry, "reset", handlerReset);
    registerCommand(commandsRegistry, "users", handlerUsers);
    registerCommand(commandsRegistry, "agg", handlerAgg);
    registerCommand(commandsRegistry, "addfeed", handlerAddFeed);
    registerCommand(commandsRegistry, "feeds", handlerFeeds);

    const args = process.argv.slice(2);
    if(args.length < 1) {
        console.error("Missing command name");
        process.exit(1);
    }

    const cmdName = args[0];
    try {
        await runCommand(commandsRegistry, cmdName, ...args.slice(1));
    } catch (error:any) {
        if(error instanceof Error) {
            console.error(error.message);
        }
        process.exit(1);
    }
    process.exit(0);
}

main();
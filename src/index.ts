import { readConfig, setUser } from "./config.js";

function main() {
    setUser("mike");
    const config = readConfig();
    console.log(config);
}

main();
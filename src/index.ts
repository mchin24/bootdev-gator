import { readConfig, setUser } from "./config";

function main() {
    setUser("mike");
    const config = readConfig();
    console.log(config);
}

main();
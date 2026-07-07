import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName?: string;
};

export function setUser(user_name: string) {
    const config = readConfig();
    config.currentUserName = user_name;
    writeConfig(config);
}

export function readConfig(): Config {
    const configPath: string = getConfigFilePath();
    const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const config = validateConfig(rawConfig);
    return config;
}

function getConfigFilePath(): string {
    const configFilePath = path.join(os.homedir(), ".gatorconfig.json");
    return configFilePath;
}

function writeConfig(config: Config): void {
    const configFilePath = getConfigFilePath();
    const configOutput = {
        "db_url": config.dbUrl,
        "current_user_name": config.currentUserName
    }

    fs.writeFileSync(configFilePath, JSON.stringify(configOutput, null, 2));
}

function validateConfig(rawConfig: any): Config {
    const config: Config = { dbUrl: 'postgres://example'};

    // Validate the config object
    if (rawConfig.db_url) config.dbUrl = rawConfig.db_url;
    if (rawConfig.current_user_name) config.currentUserName = rawConfig.current_user_name;
    return config;
}